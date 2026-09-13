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

let bunnyPlayerScriptPromise = null;

const loadBunnyPlayerScript = () => {
  if (window.playerjs?.Player) return Promise.resolve(true);
  if (bunnyPlayerScriptPromise) return bunnyPlayerScriptPromise;

  bunnyPlayerScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${BUNNY_PLAYER_JS_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.playerjs?.Player)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = BUNNY_PLAYER_JS_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.playerjs?.Player));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

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

  const bunnyEmbedUrl = useMemo(() => {
    if (!BUNNY_LIBRARY_ID || !video?.bunnyVideoId) return "";

    const base = `https://iframe.mediadelivery.net/embed/${encodeURIComponent(BUNNY_LIBRARY_ID)}/${encodeURIComponent(video.bunnyVideoId)}`;
    return `${base}${base.includes("?") ? "&" : "?"}playerjs=true`;
  }, [video?.bunnyVideoId]);

  const useBunnyEmbed = Boolean(bunnyEmbedUrl);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    bunnyPlayerRef.current = null;
  }, [video?._id, video?.id, video?.videoUrl, bunnyEmbedUrl]);

  useEffect(() => {
    if (!useBunnyEmbed || !iframeRef.current) return undefined;

    let mounted = true;
    let player = null;
    const cleanupCallbacks = [];

    const setupPlayer = async () => {
      const loaded = await loadBunnyPlayerScript();
      if (!mounted) return;

      if (!loaded || !window.playerjs?.Player) {
        setIsLoading(false);
        setHasError(true);
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
        });

        addListener("pause", (data) => {
          callbacksRef.current.onPause?.({
            currentTime: Number(data?.seconds) || 0,
            duration: Number(data?.duration) || 0,
          });
        });

        addListener("ended", (data) => {
          const seconds = Number(data?.seconds) || 0;
          const duration = Number(data?.duration) || 0;
          callbacksRef.current.onEnded?.({
            currentTime: duration > 0 ? duration : seconds,
            duration,
          });
        });
      } catch (error) {
        console.error("Bunny Player.js initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          setHasError(true);
        }
      }
    };

    setupPlayer();

    return () => {
      mounted = false;
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

  if (!useBunnyEmbed && !video.videoUrl) {
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
          key={video._id || video.id}
          src={bunnyEmbedUrl}
          title={video.title || "Course video"}
          loading="eager"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
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
          key={video._id || video.id}
          src={video.videoUrl}
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
