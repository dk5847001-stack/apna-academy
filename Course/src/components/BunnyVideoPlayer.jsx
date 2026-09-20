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
const DRIVE_PROGRESS_POLL_MS = 1000;

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

const extractGoogleDriveFileId = (value) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/i,
    /drive\.google\.com\/open\?[^#]*\bid=([^&]+)/i,
    /drive\.google\.com\/uc\?[^#]*\bid=([^&]+)/i,
    /docs\.google\.com\/file\/d\/([^/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) return raw;
  return "";
};

const resolveGoogleDriveEmbedUrl = (video) => {
  const rawUrl = typeof video?.videoUrl === "string" ? video.videoUrl.trim() : "";
  const fileId = extractGoogleDriveFileId(rawUrl);
  if (!fileId) return "";
  return "https://drive.google.com/file/d/" + encodeURIComponent(fileId) + "/preview";
};

const resolveGoogleDriveMediaUrl = (video) => {
  const rawUrl = typeof video?.videoUrl === "string" ? video.videoUrl.trim() : "";
  const fileId = extractGoogleDriveFileId(rawUrl);
  if (!fileId) return "";
  return "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(fileId);
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
  const driveProgressPollRef = useRef(null);
  const callbacksRef = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [driveMediaFailed, setDriveMediaFailed] = useState(false);

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
    [video?.videoSource, video?.videoUrl, video?.bunnyVideoId]
  );

  const googleDriveEmbedUrl = useMemo(
    () => resolveGoogleDriveEmbedUrl(video),
    [video?.videoSource, video?.videoUrl]
  );

  const googleDriveMediaUrl = useMemo(
    () => resolveGoogleDriveMediaUrl(video),
    [video?.videoSource, video?.videoUrl]
  );

  const nativeVideoUrl = useMemo(() => {
    const rawUrl = typeof video?.videoUrl === "string" ? video.videoUrl.trim() : "";
    return isNativeVideoUrl(rawUrl) ? rawUrl : "";
  }, [video?.videoUrl]);

  const pdfUrl = useMemo(() => {
    const rawUrl = typeof video?.notesPdfUrl === "string" ? video.notesPdfUrl.trim() : "";
    return rawUrl;
  }, [video?.notesPdfUrl]);

  const useBunnyEmbed = video?.videoSource !== "drive" && Boolean(bunnyEmbedUrl);
  const useGoogleDriveNative =
    video?.videoSource === "drive" &&
    Boolean(googleDriveMediaUrl) &&
    !driveMediaFailed;
  const useGoogleDriveEmbed =
    video?.videoSource === "drive" &&
    Boolean(googleDriveEmbedUrl) &&
    driveMediaFailed;
  const useNativeVideo =
    video?.videoSource !== "drive" &&
    !useBunnyEmbed &&
    Boolean(nativeVideoUrl);
  const hasVideoSource =
    useBunnyEmbed ||
    useGoogleDriveNative ||
    useGoogleDriveEmbed ||
    useNativeVideo;
  const hasPdfSource = Boolean(pdfUrl);

  const stopBunnyProgressPolling = () => {
    if (progressPollRef.current) {
      window.clearInterval(progressPollRef.current);
      progressPollRef.current = null;
    }
  };

  const stopDriveProgressPolling = () => {
    if (driveProgressPollRef.current) {
      window.clearInterval(driveProgressPollRef.current);
      driveProgressPollRef.current = null;
    }
  };

  const emitDriveProgress = (player) => {
    if (!player) return;

    const current = Number(player.currentTime);
    const duration = Number(player.duration);

    if (!Number.isFinite(current) || current < 0) return;

    callbacksRef.current.onTimeUpdate?.({
      currentTime: current,
      duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
    });
  };

  const startDriveProgressPolling = (player) => {
    stopDriveProgressPolling();
    emitDriveProgress(player);
    driveProgressPollRef.current = window.setInterval(() => {
      emitDriveProgress(player);
    }, DRIVE_PROGRESS_POLL_MS);
  };

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setDriveMediaFailed(false);
    bunnyPlayerRef.current = null;
    stopBunnyProgressPolling();
    stopDriveProgressPolling();
  }, [
    video?._id,
    video?.id,
    video?.videoSource,
    video?.videoUrl,
    video?.bunnyVideoId,
    bunnyEmbedUrl,
    googleDriveEmbedUrl,
    googleDriveMediaUrl,
    nativeVideoUrl,
  ]);

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

              startBunnyProgressPolling();
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
    if (hasPdfSource) {
      return (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor: "#111827",
            overflow: "hidden",
          }}
        >
          <iframe
            src={pdfUrl}
            title={video.title || "Course PDF"}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              border: 0,
              display: "block",
              backgroundColor: "#ffffff",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 12,
              bottom: 12,
              zIndex: 2,
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <Typography
              component="a"
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              sx={{
                color: "#ffffff",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Open PDF ↗
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000000", display: "flex", alignItems: "center", justifyContent: "center", px: 3 }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>Learning content is unavailable.</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000000", overflow: "hidden" }}>
      <style>{`
        /* Chrome/Edge native media controls: hide the picture-in-picture/pop-out button. */
        video.apna-academy-video::-webkit-media-controls-picture-in-picture-button {
          display: none !important;
        }
        /* Keep remote playback disabled where Chromium exposes this control. */
        video.apna-academy-video::-webkit-media-controls-remote-playback-button {
          display: none !important;
        }
      `}</style>

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
      ) : useGoogleDriveNative ? (
        <video
          className="apna-academy-video"
          key={`${video._id || video.id || "video"}-${googleDriveMediaUrl}`}
          src={googleDriveMediaUrl}
          poster={video.thumbnailUrl || undefined}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedMetadata={(event) => {
            const player = event.currentTarget;
            setIsLoading(false);
            setHasError(false);
            if (currentTimeRef.current > 0 && Number.isFinite(currentTimeRef.current)) {
              try { player.currentTime = currentTimeRef.current; } catch {}
            }
            callbacksRef.current.onLoadedMetadata?.(player);
            emitDriveProgress(player);
          }}
          onLoadedData={(event) => emitDriveProgress(event.currentTarget)}
          onDurationChange={(event) => emitDriveProgress(event.currentTarget)}
          onCanPlay={(event) => {
            setIsLoading(false);
            emitDriveProgress(event.currentTarget);
          }}
          onWaiting={() => setIsLoading(true)}
          onPlaying={(event) => {
            setIsLoading(false);
            startDriveProgressPolling(event.currentTarget);
          }}
          onError={() => {
            stopDriveProgressPolling();
            setIsLoading(false);
            setDriveMediaFailed(true);
          }}
          onTimeUpdate={(event) => emitDriveProgress(event.currentTarget)}
          onEnded={(event) => {
            stopDriveProgressPolling();
            callbacksRef.current.onEnded?.(event.currentTarget);
            emitDriveProgress(event.currentTarget);
          }}
          onPlay={(event) => {
            callbacksRef.current.onPlay?.(event.currentTarget);
            startDriveProgressPolling(event.currentTarget);
          }}
          onPause={(event) => {
            stopDriveProgressPolling();
            callbacksRef.current.onPause?.(event.currentTarget);
            emitDriveProgress(event.currentTarget);
          }}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", backgroundColor: "#000000" }}
        />
      ) : useGoogleDriveEmbed ? (
        <iframe
          key={`${video._id || video.id || "video"}-${googleDriveEmbedUrl}`}
          src={googleDriveEmbedUrl}
          title={video.title || "Google Drive course video"}
          loading="eager"
          referrerPolicy="origin"
          allow="autoplay; fullscreen"
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
          className="apna-academy-video"
          key={`${video._id || video.id || "video"}-${nativeVideoUrl}`}
          src={nativeVideoUrl}
          poster={video.thumbnailUrl || undefined}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
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
