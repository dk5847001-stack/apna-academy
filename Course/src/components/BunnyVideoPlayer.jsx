import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

const BUNNY_LIBRARY_ID =
  import.meta.env.VITE_BUNNY_LIBRARY_ID || "";

/* =========================================================
   BUNNY VIDEO PLAYER

   Backend authorization remains the security boundary.
   The component only renders a video that the backend has
   already authorized.

   Playback priority:
   1. Bunny Stream iframe when bunnyVideoId + library ID exist.
   2. Authorized videoUrl fallback for existing records.
========================================================= */

export default function BunnyVideoPlayer({
  video = null,
  currentTime = 0,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlay,
  onPause,
}) {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const bunnyEmbedUrl = useMemo(() => {
    if (!BUNNY_LIBRARY_ID || !video?.bunnyVideoId) {
      return "";
    }

    return `https://iframe.mediadelivery.net/embed/${encodeURIComponent(
      BUNNY_LIBRARY_ID
    )}/${encodeURIComponent(video.bunnyVideoId)}`;
  }, [video?.bunnyVideoId]);

  const useBunnyEmbed = Boolean(bunnyEmbedUrl);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [video?._id, video?.id, video?.videoUrl, bunnyEmbedUrl]);

  if (!video) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
          Select a lesson to start learning.
        </Typography>
      </Box>
    );
  }

  if (video.isLocked) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
        }}
      >
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <Typography variant="h6" fontWeight={800} sx={{ color: "#ffffff" }}>
            This lesson is locked
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Purchase the course or wait until this module unlocks.
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!useBunnyEmbed && !video.videoUrl) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
        }}
      >
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <CircularProgress size={30} sx={{ color: "#ffffff" }} />
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
            Video source is unavailable.
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
          }}
        >
          <CircularProgress size={34} sx={{ color: "#ffffff" }} />
        </Box>
      )}

      {hasError && (
        <Stack
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          sx={{ position: "absolute", inset: 0, zIndex: 3, p: 3 }}
        >
          <Alert severity="error" variant="outlined" sx={{ maxWidth: 520 }}>
            This video could not be loaded. Please try again or select another lesson.
          </Alert>
        </Stack>
      )}

      {useBunnyEmbed ? (
        <iframe
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
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            backgroundColor: "#000000",
          }}
        />
      ) : (
        <video
          ref={videoRef}
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

            if (currentTime > 0 && Number.isFinite(currentTime)) {
              try {
                player.currentTime = currentTime;
              } catch {
                // Browser may reject seeking before metadata is ready.
              }
            }

            onLoadedMetadata?.(event);
          }}
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onTimeUpdate={(event) => onTimeUpdate?.(event.currentTarget)}
          onEnded={(event) => onEnded?.(event.currentTarget)}
          onPlay={(event) => onPlay?.(event.currentTarget)}
          onPause={(event) => onPause?.(event.currentTarget)}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "contain",
            backgroundColor: "#000000",
          }}
        />
      )}
    </Box>
  );
}
