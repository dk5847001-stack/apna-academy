import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

const BUNNY_LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID || "";
const BUNNY_PLAYER_JS_URL = "https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js";
const BUNNY_PROGRESS_POLL_MS = 2000;

let bunnyPlayerScriptPromise = null;

const appendPlayerJsFlag = (url) => {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("playerjs")) parsed.searchParams.set("playerjs", "true");
    return parsed.toString();
  } catch {
    return url;
  }
};

const resolveBunnyEmbedUrl = (video) => {
  const rawUrl = typeof video?.videoUrl === "string" ? video.videoUrl.trim() : "";

  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const isBunnyPlayerHost =
        parsed.hostname === "iframe.mediadelivery.net" ||
        parsed.hostname === "player.mediadelivery.net";

      if (isBunnyPlayerHost) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        const modeIndex = parts.findIndex((part) => part === "embed" || part === "play");

        if (modeIndex >= 0 && parts[modeIndex + 1] && parts[modeIndex + 2]) {
          parts[modeIndex] = "embed";
          parsed.hostname = "player.mediadelivery.net";
          parsed.pathname = `/${parts.join("/")}`;
          return appendPlayerJsFlag(parsed.toString());
        }
      }
    } catch {
      // Fall through to the Bunny ID/library configuration or native video URL.
    }
  }

  if (BUNNY_LIBRARY_ID && video?.bunnyVideoId) {
    const base = `https://player.mediadelivery.net/embed/${encodeURIComponent(BUNNY_LIBRARY_ID)}/${encodeURIComponent(video.bunnyVideoId)}`;
    return appendPlayerJsFlag(base);
  }

  return "";
};

const isNativeVideoUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    return /\.(mp4|webm|ogg|m3u8)$/.test(path) || parsed.hostname.endsWith("b-cdn.net");
  } catch {
    return false;
  }
};

const loadBunnyPlayerScript = () => {
  if (window.playerjs?.Player) return Promise.resolve(true);
  if (bunnyPlayerScriptPromise) return bunnyPlayerScriptPromise;

  bunnyPlayerScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${BUNNY_PLAYER_JS_URL}"]`);
    if (existing) {
      const finish = () => resolve(Boolean(window.playerjs?.Player));
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", finish, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = BUNNY_PLAYER_JS_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.playerjs?.Player));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  }).catch(() => false);

  return bunnyPlayerScriptPromise;
};

export default function BunnyVideoPlayer({
  video = null,
  currentTime = 0,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlay,
  onPause,
}) {
  const iframeRef = useRef(null);
  const bunnyPlayerRef = useRef(null);
  const currentTimeRef = useRef(0);
  const progressPollRef = useRef(null);
  const callbacksRef = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  currentTimeRef.current = Number(currentTime) || 0;
  callbacksRef.current = {
    onTimeUpdate,
    onLoadedMetadata,
    onEnded,
    onPlay,
    onPause,
  };

  const bunnyEmbedUrl = useMemo(
    () => resolveBunnyEmbedUrl(video),
    [video?.videoUrl, video?.bunnyVideoId]
  );

  const nativeVideoUrl = useMemo(() => {
    const rawUrl = typeof video?.videoUrl === "string" ? video.videoUrl.trim() : "";
    return isNativeVideoUrl(rawUrl) ? rawUrl : "";
  }, [video?.videoUrl]);

  const useBunnyEmbed = Boolean(bunnyEmbedUrl);
  const useNativeVideo = !useBunnyEmbed && Boolean(nativeVideoUrl);
  const hasVideoSource = useBunnyEmbed || useNativeVideo;

  const stopBunnyProgressPolling = () => {
    if (progressPollRef.current) {
      window.clearInterval(progressPollRef.current);
      progressPollRef.current = null;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    bunnyPlayerRef.current = null;
    stopBunnyProgressPolling();
  }, [video?._id, video?.id, video?.videoUrl, video?.bunnyVideoId, bunnyEmbedUrl, nativeVideoUrl]);

  useEffect(() => {
    if (!useBunnyEmbed || !iframeRef.current) return undefined;

    let mounted = true;
    let player = null;
    const cleanupCallbacks = [];

    const emitBunnyProgress = () => {
      if (!mounted || !player) return;

      try {
        player.getCurrentTime((currentValue) => {
          if (!mounted || !player) return;

          player.getDuration((durationValue) => {
            if (!mounted) return;

            const current = Number(currentValue);
            const duration = Number(durationValue);

            if (!Number.isFinite(current) || current < 0) return;

            callbacksRef.current.onTimeUpdate?.({
              currentTime: current,
              duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
            });
          });
        });
      } catch (error) {
        console.warn("Unable to read Bunny playback position:", error);
      }
    };

    const startBunnyProgressPolling = () => {
      stopBunnyProgressPolling();
      emitBunnyProgress();
      progressPollRef.current = window.setInterval(
        emitBunnyProgress,
        BUNNY_PROGRESS_POLL_MS
      );
    };

    const setupPlayer = async () => {
      const loaded = await loadBunnyPlayerScript();
      if (!mounted) return;

      // Bunny playback must not depend on Player.js. The new Bunny player
      // can play normally even when the legacy Player.js bridge is unavailable.
      if (!loaded || !window.playerjs?.Player) {
        setIsLoading(false);
        return;
      }

      try {
        player = new window.playerjs.Player(iframeRef.current);
        bunnyPlayerRef.current = player;

        const addListener = (eventName, callback) => {
          player.on(eventName, callback);
          cleanupCallbacks.push(() => {
            try {
              player.off?.(eventName, callback);
            } catch {
              // Some Player.js versions do not expose off().
            }
          });
        };

        addListener("ready", () => {
          if (!mounted) return;
          setIsLoading(false);
          setHasError(false);

          player.getDuration((durationValue) => {
            const duration = Number(durationValue) || 0;
            player.getCurrentTime((currentValue) => {
              let position = Number(currentValue) || 0;
              const savedPosition = currentTimeRef.current;

              if (savedPosition > 0 && duration > 0 && savedPosition < duration) {
                position = savedPosition;
                player.setCurrentTime(position);
              }

              callbacksRef.current.onLoadedMetadata?.({
                duration,
                currentTime: position,
              });

              emitBunnyProgress();
            });
          });
        });

        addListener("timeupdate", (data) => {
          const seconds = Number(data?.seconds);
          const duration = Number(data?.duration);
          if (!Number.isFinite(seconds)) return;

          callbacksRef.current.onTimeUpdate?.({
            currentTime: seconds,
            duration: Number.isFinite(duration) ? duration : 0,
          });
        });

        addListener("play", () => {
          callbacksRef.current.onPlay?.({ currentTime: 0, duration: 0 });
          startBunnyProgressPolling();
        });

        addListener("pause", (data) => {
          stopBunnyProgressPolling();
          callbacksRef.current.onPause?.({
            currentTime: Number(data?.seconds) || 0,
            duration: Number(data?.duration) || 0,
          });
          emitBunnyProgress();
        });

        addListener("ended", (data) => {
          stopBunnyProgressPolling();
          const seconds = Number(data?.seconds) || 0;
          const duration = Number(data?.duration) || 0;
          callbacksRef.current.onEnded?.({
            currentTime: duration > 0 ? duration : seconds,
            duration,
          });
        });
      } catch (error) {
        // Do not block the actual Bunny iframe when the optional Player.js
        // bridge cannot initialize.
        console.warn("Bunny Player.js bridge unavailable; iframe playback remains active.", error);
        if (mounted) setIsLoading(false);
      }
    };

    setupPlayer();

    return () => {
      mounted = false;
      stopBunnyProgressPolling();
      cleanupCallbacks.forEach((cleanup) => cleanup());
      bunnyPlayerRef.current = null;
      player = null;
    };
  }, [useBunnyEmbed, bunnyEmbedUrl]);

  if (!video) {
    return (
      <Box sx={{ width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>Select a lesson to start learning.</Typography>
      </Box>
    );
  }

  if (video.isLocked) {
    return (
      <Box sx={{ width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000000", display: "flex", alignItems: "center", justifyContent: "center", px: 3 }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <Typography variant="h6" fontWeight={800} sx={{ color: "#ffffff" }}>This lesson is locked</Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Purchase the course or wait until this module unlocks.</Typography>
        </Stack>
      </Box>
    );
  }

  if (!hasVideoSource) {
    return (
      <Box sx={{ width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000000", display: "flex", alignItems: "center", justifyContent: "center", px: 3 }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <CircularProgress size={30} sx={{ color: "#ffffff" }} />
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>Video source is unavailable.</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000000", overflow: "hidden" }}>
      {isLoading && (
        <Box sx={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000" }}>
          <CircularProgress size={34} sx={{ color: "#ffffff" }} />
        </Box>
      )}

      {hasError && (
        <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ position: "absolute", inset: 0, zIndex: 3, p: 3 }}>
          <Alert severity="error" variant="outlined" sx={{ maxWidth: 520 }}>This video could not be loaded. Please try again or select another lesson.</Alert>
        </Stack>
      )}

      {useBunnyEmbed ? (
        <iframe
          ref={iframeRef}
          key={`${video._id || video.id || "video"}-${bunnyEmbedUrl}`}
          src={bunnyEmbedUrl}
          title={video.title || "Course video"}
          loading="eager"
          referrerPolicy="origin"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          style={{ width: "100%", height: "100%", border: 0, display: "block", backgroundColor: "#000000" }}
        />
      ) : (
        <video
          key={`${video._id || video.id || "video"}-${nativeVideoUrl}`}
          src={nativeVideoUrl}
          poster={video.thumbnailUrl || undefined}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          disablePictureInPicture
          onLoadedMetadata={(event) => {
            const player = event.currentTarget;
            setIsLoading(false);
            setHasError(false);
            if (currentTimeRef.current > 0 && Number.isFinite(currentTimeRef.current)) {
              try {
                player.currentTime = currentTimeRef.current;
              } catch {
                // Browser may reject seeking before metadata is ready.
              }
            }
            callbacksRef.current.onLoadedMetadata?.(player);
          }}
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onTimeUpdate={(event) => callbacksRef.current.onTimeUpdate?.(event.currentTarget)}
          onEnded={(event) => callbacksRef.current.onEnded?.(event.currentTarget)}
          onPlay={(event) => callbacksRef.current.onPlay?.(event.currentTarget)}
          onPause={(event) => callbacksRef.current.onPause?.(event.currentTarget)}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", backgroundColor: "#000000" }}
        />
      )}
    </Box>
  );
}
