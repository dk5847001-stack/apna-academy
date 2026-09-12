import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

/* =========================================================
   BUNNY VIDEO PLAYER

   The backend is responsible for deciding whether the
   requested video is accessible.

   This component only plays the already-authorized URL.
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
        <Typography
          sx={{
            color:
              "rgba(255,255,255,0.65)",
          }}
        >
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
        <Stack
          spacing={1.5}
          alignItems="center"
          textAlign="center"
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              color: "#ffffff",
            }}
          >
            This lesson is locked
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color:
                "rgba(255,255,255,0.6)",
            }}
          >
            Purchase the course or wait
            until this module unlocks.
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!video.videoUrl) {
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
        <Stack
          spacing={1.5}
          alignItems="center"
          textAlign="center"
        >
          <CircularProgress
            size={30}
            sx={{
              color: "#ffffff",
            }}
          />

          <Typography
            variant="body2"
            sx={{
              color:
                "rgba(255,255,255,0.65)",
            }}
          >
            Video source is unavailable.
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "16 / 9",
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      <video
        key={video._id || video.id}
        src={video.videoUrl}
        poster={
          video.thumbnailUrl || undefined
        }
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        disablePictureInPicture
        onLoadedMetadata={(event) => {
          const player =
            event.currentTarget;

          /*
           * Restore the last server-saved
           * position after metadata becomes
           * available.
           */
          if (
            currentTime > 0 &&
            Number.isFinite(
              currentTime
            )
          ) {
            try {
              player.currentTime =
                currentTime;
            } catch {
              // Browser may reject seeking
              // before metadata is ready.
            }
          }

          onLoadedMetadata?.(
            event
          );
        }}
        onTimeUpdate={(event) => {
          onTimeUpdate?.(
            event.currentTarget
          );
        }}
        onEnded={(event) => {
          onEnded?.(
            event.currentTarget
          );
        }}
        onPlay={(event) => {
          onPlay?.(
            event.currentTarget
          );
        }}
        onPause={(event) => {
          onPause?.(
            event.currentTarget
          );
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          backgroundColor: "#000000",
        }}
      />
    </Box>
  );
}