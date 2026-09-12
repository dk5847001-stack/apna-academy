import { useMemo, useState } from "react";

import {
  ArrowLeft,
  Check,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Lock,
  Menu,
  PlayCircle,
  X,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import BunnyVideoPlayer from "../components/BunnyVideoPlayer";

/* =========================================================
   HELPERS
========================================================= */

const getVideoId = (video) =>
  video?._id ||
  video?.id ||
  "";

const getVideoTitle = (video) =>
  video?.title ||
  "Untitled lesson";

const getVideoDuration = (video) => {
  const duration = Number(
    video?.duration
  );

  if (!Number.isFinite(duration) || duration <= 0) {
    return "";
  }

  const minutes = Math.floor(
    duration / 60
  );

  const seconds = Math.floor(
    duration % 60
  );

  return `${minutes}:${String(
    seconds
  ).padStart(2, "0")}`;
};

const isVideoLocked = (video) =>
  Boolean(
    video?.isLocked ??
      video?.locked
  );

const isVideoCompleted = (video) =>
  Boolean(
    video?.isCompleted ??
      video?.completed
  );

/* =========================================================
   COURSE PLAYER LAYOUT
========================================================= */

export default function CoursePlayerLayout({
  course = null,
  courseTitle = "",
  modules = [],
  progress = 0,
  currentVideo = null,
  currentPosition = 0,

  onBack,
  onPrevious,
  onNext,
  onVideoSelect,

  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlay,
  onPause,
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [openModule, setOpenModule] =
    useState(
      modules?.[0]?.order ??
        modules?.[0]?.id ??
        null
    );

  const normalizedProgress =
    Math.min(
      100,
      Math.max(
        0,
        Number(progress) || 0
      )
    );

  const safeModules = Array.isArray(
    modules
  )
    ? modules
    : [];

  const allVideos = useMemo(() => {
    return safeModules.flatMap(
      (module) =>
        Array.isArray(module?.videos)
          ? module.videos
          : []
    );
  }, [safeModules]);

  const currentVideoIndex =
    currentVideo
      ? allVideos.findIndex(
          (video) =>
            String(
              getVideoId(video)
            ) ===
            String(
              getVideoId(currentVideo)
            )
        )
      : -1;

  const hasPrevious =
    currentVideoIndex > 0;

  const hasNext =
    currentVideoIndex >= 0 &&
    currentVideoIndex <
      allVideos.length - 1;

  const handleVideoClick = (
    video
  ) => {
    if (!video) {
      return;
    }

    if (isVideoLocked(video)) {
      return;
    }

    onVideoSelect?.(video);

    setSidebarOpen(false);
  };

  const handlePreviousClick = () => {
    if (!hasPrevious) {
      return;
    }

    const previousVideo =
      allVideos[
        currentVideoIndex - 1
      ];

    if (
      previousVideo &&
      !isVideoLocked(previousVideo)
    ) {
      onPrevious?.(
        previousVideo
      );
    }
  };

  const handleNextClick = () => {
    if (!hasNext) {
      return;
    }

    const nextVideo =
      allVideos[
        currentVideoIndex + 1
      ];

    if (
      nextVideo &&
      !isVideoLocked(nextVideo)
    ) {
      onNext?.(nextVideo);
    }
  };

  const renderSidebarContent = (
    mobile = false
  ) => (
    <Box
      sx={{
        width: mobile
          ? "min(390px, 90vw)"
          : 370,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      {/* =====================================================
          SIDEBAR HEADER
      ===================================================== */}

      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          borderBottom:
            "1px solid #e5e7eb",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Button
            variant="text"
            startIcon={
              <ArrowLeft />
            }
            onClick={onBack}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "#334155",
              px: 0,
              "&:hover": {
                backgroundColor:
                  "transparent",
                color: "#2563eb",
              },
            }}
          >
            Back to course
          </Button>

          {mobile && (
            <IconButton
              onClick={() =>
                setSidebarOpen(false)
              }
              aria-label="Close course menu"
            >
              <X />
            </IconButton>
          )}
        </Stack>

        <Typography
          sx={{
            mt: 2,
            fontSize: {
              xs: "1.05rem",
              sm: "1.15rem",
            },
            fontWeight: 800,
            lineHeight: 1.35,
            color: "#0f172a",
          }}
        >
          {courseTitle ||
            course?.title ||
            "Course"}
        </Typography>

        {/* ===================================================
            SINGLE OVERALL PROGRESS
        =================================================== */}

        <Box sx={{ mt: 2.25 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 0.8 }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
            >
              Overall progress
            </Typography>

            <Typography
              variant="caption"
              fontWeight={800}
              color="primary.main"
            >
              {Math.round(
                normalizedProgress
              )}
              %
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={
              normalizedProgress
            }
            sx={{
              height: 7,
              borderRadius: 99,
              backgroundColor:
                "#e2e8f0",
              "& .MuiLinearProgress-bar":
                {
                  borderRadius: 99,
                },
            }}
          />
        </Box>
      </Box>

      {/* =====================================================
          MODULES
      ===================================================== */}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {safeModules.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No course modules available.
            </Typography>
          </Box>
        ) : (
          safeModules.map(
            (module, moduleIndex) => {
              const moduleKey =
                module?.order ??
                module?.id ??
                moduleIndex + 1;

              const isOpen =
                String(
                  openModule
                ) ===
                String(moduleKey);

              const moduleVideos =
                Array.isArray(
                  module?.videos
                )
                  ? module.videos
                  : [];

              return (
                <Box
                  key={
                    module?._id ||
                    moduleKey
                  }
                  sx={{
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <Button
                    fullWidth
                    onClick={() =>
                      setOpenModule(
                        isOpen
                          ? null
                          : moduleKey
                      )
                    }
                    sx={{
                      px: 2.5,
                      py: 2,
                      justifyContent:
                        "space-between",
                      textAlign: "left",
                      textTransform:
                        "none",
                      color: "#0f172a",
                      backgroundColor:
                        isOpen
                          ? "#eff6ff"
                          : "#ffffff",
                      borderRadius: 0,
                      "&:hover": {
                        backgroundColor:
                          "#f8fafc",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 0,
                        pr: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize:
                            "0.92rem",
                          fontWeight: 800,
                          lineHeight: 1.45,
                        }}
                      >
                        {moduleIndex +
                          1}
                        .{" "}
                        {module?.title ||
                          "Module"}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {
                          moduleVideos.length
                        }{" "}
                        lesson
                        {moduleVideos.length ===
                        1
                          ? ""
                          : "s"}
                      </Typography>
                    </Box>

                    <ExpandMore
                      sx={{
                        flexShrink: 0,
                        transform:
                          isOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition:
                          "transform 180ms ease",
                        color:
                          isOpen
                            ? "#2563eb"
                            : "#64748b",
                      }}
                    />
                  </Button>

                  {isOpen &&
                    moduleVideos.length >
                      0 && (
                      <Box
                        sx={{
                          backgroundColor:
                            "#f8fafc",
                        }}
                      >
                        {moduleVideos.map(
                          (video) => {
                            const active =
                              String(
                                getVideoId(
                                  currentVideo
                                )
                              ) ===
                              String(
                                getVideoId(
                                  video
                                )
                              );

                            const locked =
                              isVideoLocked(
                                video
                              );

                            const completed =
                              isVideoCompleted(
                                video
                              );

                            return (
                              <Button
                                key={
                                  getVideoId(
                                    video
                                  )
                                }
                                fullWidth
                                disabled={
                                  locked
                                }
                                onClick={() =>
                                  handleVideoClick(
                                    video
                                  )
                                }
                                sx={{
                                  minHeight: 68,
                                  px: 2.5,
                                  py: 1.25,
                                  justifyContent:
                                    "flex-start",
                                  alignItems:
                                    "flex-start",
                                  gap: 1.25,
                                  textAlign:
                                    "left",
                                  textTransform:
                                    "none",
                                  borderRadius: 0,
                                  borderLeft:
                                    active
                                      ? "3px solid #2563eb"
                                      : "3px solid transparent",
                                  backgroundColor:
                                    active
                                      ? "#dbeafe"
                                      : "transparent",
                                  color:
                                    locked
                                      ? "#94a3b8"
                                      : "#334155",
                                  "&:hover":
                                    {
                                      backgroundColor:
                                        locked
                                          ? "transparent"
                                          : "#eef2ff",
                                    },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    mt: 0.1,
                                    flexShrink: 0,
                                    borderRadius:
                                      "50%",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    backgroundColor:
                                      completed
                                        ? "#dcfce7"
                                        : locked
                                          ? "#e2e8f0"
                                          : active
                                            ? "#dbeafe"
                                            : "#ffffff",
                                    border:
                                      "1px solid",
                                    borderColor:
                                      completed
                                        ? "#bbf7d0"
                                        : active
                                          ? "#bfdbfe"
                                          : "#e2e8f0",
                                  }}
                                >
                                  {completed ? (
                                    <Check
                                      sx={{
                                        fontSize: 17,
                                        color:
                                          "#16a34a",
                                      }}
                                    />
                                  ) : locked ? (
                                    <Lock
                                      sx={{
                                        fontSize: 16,
                                        color:
                                          "#64748b",
                                      }}
                                    />
                                  ) : (
                                    <PlayCircle
                                      sx={{
                                        fontSize: 18,
                                        color:
                                          active
                                            ? "#2563eb"
                                            : "#64748b",
                                      }}
                                    />
                                  )}
                                </Box>

                                <Box
                                  sx={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.86rem",
                                      fontWeight:
                                        active
                                          ? 800
                                          : 600,
                                      lineHeight:
                                        1.4,
                                      color:
                                        locked
                                          ? "#94a3b8"
                                          : active
                                            ? "#1d4ed8"
                                            : "#334155",
                                    }}
                                  >
                                    {getVideoTitle(
                                      video
                                    )}
                                  </Typography>

                                  <Stack
                                    direction="row"
                                    spacing={
                                      0.75
                                    }
                                    alignItems="center"
                                    sx={{
                                      mt: 0.4,
                                    }}
                                  >
                                    {video?.isPreview && (
                                      <Chip
                                        label="Preview"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize:
                                            "0.65rem",
                                          fontWeight:
                                            800,
                                          backgroundColor:
                                            "#eff6ff",
                                          color:
                                            "#2563eb",
                                        }}
                                      />
                                    )}

                                    {getVideoDuration(
                                      video
                                    ) && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {getVideoDuration(
                                          video
                                        )}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>
                              </Button>
                            );
                          }
                        )}
                      </Box>
                    )}
                </Box>
              );
            }
          )
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      {/* =====================================================
          MOBILE TOP BAR
      ===================================================== */}

      <Box
        sx={{
          display: {
            xs: "flex",
            lg: "none",
          },
          height: 64,
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          backgroundColor: "#ffffff",
          borderBottom:
            "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <IconButton
          onClick={() =>
            setSidebarOpen(true)
          }
          aria-label="Open course menu"
        >
          <Menu />
        </IconButton>

        <Typography
          sx={{
            maxWidth: "65%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.9rem",
            fontWeight: 800,
          }}
        >
          {courseTitle ||
            course?.title ||
            "Course"}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.85rem",
            fontWeight: 800,
            color: "#2563eb",
          }}
        >
          {Math.round(
            normalizedProgress
          )}
          %
        </Typography>
      </Box>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        sx={{
          display: {
            xs: "block",
            lg: "none",
          },
        }}
      >
        {renderSidebarContent(true)}
      </Drawer>

      {/* =====================================================
          DESKTOP LAYOUT
      ===================================================== */}

      <Box
        sx={{
          display: "flex",
          minHeight: {
            xs: "calc(100vh - 64px)",
            lg: "100vh",
          },
        }}
      >
        {/* ===================================================
            DESKTOP SIDEBAR
        =================================================== */}

        <Box
          component="aside"
          sx={{
            display: {
              xs: "none",
              lg: "block",
            },
            width: 370,
            flexShrink: 0,
            borderRight:
              "1px solid #e5e7eb",
            backgroundColor:
              "#ffffff",
          }}
        >
          {renderSidebarContent(
            false
          )}
        </Box>

        {/* ===================================================
            MAIN PLAYER AREA
        =================================================== */}

        <Box
          component="main"
          sx={{
            minWidth: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* =================================================
              VIDEO
          ================================================= */}

          <Box
            sx={{
              width: "100%",
              backgroundColor:
                "#020617",
            }}
          >
            <BunnyVideoPlayer
              video={currentVideo}
              currentTime={
                currentPosition
              }
              onTimeUpdate={
                onTimeUpdate
              }
              onLoadedMetadata={
                onLoadedMetadata
              }
              onEnded={onEnded}
              onPlay={onPlay}
              onPause={onPause}
            />
          </Box>

          {/* =================================================
              VIDEO INFORMATION
          ================================================= */}

          <Box
            sx={{
              px: {
                xs: 2,
                sm: 3,
                lg: 4,
              },
              py: {
                xs: 2.5,
                sm: 3,
              },
              backgroundColor:
                "#ffffff",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            <Stack
              spacing={1.25}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: "1.1rem",
                      sm: "1.3rem",
                    },
                    fontWeight: 800,
                    lineHeight: 1.35,
                    color: "#0f172a",
                  }}
                >
                  {getVideoTitle(
                    currentVideo
                  )}
                </Typography>

                {currentVideo?.isPreview && (
                  <Chip
                    label="Preview"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      backgroundColor:
                        "#eff6ff",
                      color: "#2563eb",
                    }}
                  />
                )}
              </Stack>

              {currentVideo?.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                  }}
                >
                  {
                    currentVideo.description
                  }
                </Typography>
              )}
            </Stack>
          </Box>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <Box
            sx={{
              px: {
                xs: 2,
                sm: 3,
                lg: 4,
              },
              py: 2,
              backgroundColor:
                "#ffffff",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={2}
            >
              <Button
                variant="outlined"
                startIcon={
                  <ChevronLeft />
                }
                disabled={!hasPrevious}
                onClick={
                  handlePreviousClick
                }
                sx={{
                  minHeight: 42,
                  px: 2,
                  borderRadius: 2,
                  textTransform:
                    "none",
                  fontWeight: 800,
                }}
              >
                Previous
              </Button>

              <Button
                variant="contained"
                endIcon={
                  <ChevronRight />
                }
                disabled={!hasNext}
                onClick={
                  handleNextClick
                }
                sx={{
                  minHeight: 42,
                  px: 2.25,
                  borderRadius: 2,
                  textTransform:
                    "none",
                  fontWeight: 800,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                Next lesson
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* =================================================
              MOBILE OVERALL PROGRESS
          ================================================= */}

          <Paper
            elevation={0}
            sx={{
              display: {
                xs: "block",
                lg: "none",
              },
              mx: 2,
              my: 2,
              p: 2,
              border:
                "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor:
                "#ffffff",
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                >
                  Overall progress
                </Typography>

                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="primary.main"
                >
                  {Math.round(
                    normalizedProgress
                  )}
                  %
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={
                  normalizedProgress
                }
                sx={{
                  height: 7,
                  borderRadius: 99,
                }}
              />
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}