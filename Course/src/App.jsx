import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import CourseDetails from "./pages/CourseDetails";
import CoursePlayerLayout from "./layouts/CoursePlayerLayout";

import {
  COURSE_ROUTES,
  STORAGE_KEYS,
} from "./constants/config";

import {
  getCourseBySlug,
} from "./services/course.service";

import {
  getLearningCourse,
  normalizeLearningCourse,
  normalizeLearningVideo,
} from "./services/learning.service";

import useVideoProgress from "./hooks/useVideoProgress";

/* =========================================================
   COURSE HOME
========================================================= */

function CourseHome() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        textAlign="center"
      >
        <Typography
          variant="overline"
          color="primary.main"
          fontWeight={900}
          letterSpacing={3}
        >
          ApnaAcademy
        </Typography>

        <Typography
          variant="h2"
          fontWeight={900}
          sx={{
            fontSize: {
              xs: "2.2rem",
              sm: "3.5rem",
            },
          }}
        >
          Courses
        </Typography>

        <Typography
          color="text.secondary"
          maxWidth={500}
        >
          Select a course to start learning.
        </Typography>
      </Stack>
    </Box>
  );
}

/* =========================================================
   AUTH CHECK
========================================================= */

function hasAuthenticationToken() {
  return Boolean(
    localStorage.getItem(
      STORAGE_KEYS.TOKEN
    )
  );
}

/* =========================================================
   VIDEO ID HELPER
========================================================= */

function getVideoId(video) {
  if (!video) {
    return "";
  }

  return (
    video._id ||
    video.id ||
    ""
  );
}

/* =========================================================
   LAST WATCHED VIDEO ID
========================================================= */

function getLastWatchedVideoId(
  lastWatchedVideo
) {
  if (!lastWatchedVideo) {
    return "";
  }

  if (
    typeof lastWatchedVideo ===
    "object"
  ) {
    return (
      lastWatchedVideo._id ||
      lastWatchedVideo.id ||
      ""
    );
  }

  return lastWatchedVideo;
}

/* =========================================================
   LEARNING PAGE
========================================================= */

function CourseLearningPage() {
  const {
    slug,
    videoId,
  } = useParams();

  const navigate =
    useNavigate();

  const [course, setCourse] =
    useState(null);

  const [modules, setModules] =
    useState([]);

  const [progress, setProgress] =
    useState(null);

  const [
    currentVideo,
    setCurrentVideo,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD LEARNING DATA
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadLearningData =
      async () => {
        try {
          setLoading(true);
          setError("");

          /* -----------------------------------------------
             Authentication
          ----------------------------------------------- */

          if (
            !hasAuthenticationToken()
          ) {
            navigate(
              "/login",
              {
                replace: true,
                state: {
                  message:
                    "Please login to continue learning.",
                  redirectTo:
                    COURSE_ROUTES.LEARN(
                      slug
                    ),
                },
              }
            );

            return;
          }

          /* -----------------------------------------------
             Get public course details
          ----------------------------------------------- */

          const courseResult =
            await getCourseBySlug(
              slug
            );

          if (!mounted) {
            return;
          }

          const courseData =
            courseResult?.course;

          if (!courseData) {
            throw new Error(
              "Course information could not be loaded."
            );
          }

          const courseId =
            courseData._id ||
            courseData.id;

          if (!courseId) {
            throw new Error(
              "Course ID is missing."
            );
          }

          /* -----------------------------------------------
             Get protected learning data
          ----------------------------------------------- */

          const learningResult =
            await getLearningCourse(
              courseId
            );

          if (!mounted) {
            return;
          }

          const normalized =
            normalizeLearningCourse(
              learningResult
            );

          /* -----------------------------------------------
             Purchase/access check
          ----------------------------------------------- */

          if (
            !normalized.access
              .isPurchased
          ) {
            navigate(
              COURSE_ROUTES.DETAILS(
                slug
              ),
              {
                replace: true,
                state: {
                  message:
                    "Please enroll in this course to start learning.",
                },
              }
            );

            return;
          }

          /* -----------------------------------------------
             Save course data
          ----------------------------------------------- */

          setCourse(
            normalized.course ||
              courseData
          );

          setModules(
            normalized.modules
          );

          setProgress(
            normalized.progress
          );

          /* -----------------------------------------------
             Find all videos
          ----------------------------------------------- */

          const availableVideos =
            normalized.modules.flatMap(
              (module) =>
                Array.isArray(
                  module?.videos
                )
                  ? module.videos
                  : []
            );

          let selectedVideo =
            null;

          /* -----------------------------------------------
             Requested video
          ----------------------------------------------- */

          if (videoId) {
            selectedVideo =
              availableVideos.find(
                (video) =>
                  String(
                    getVideoId(video)
                  ) ===
                  String(videoId)
              ) || null;
          }

          /* -----------------------------------------------
             Continue Learning
          ----------------------------------------------- */

          if (
            !selectedVideo
          ) {
            const lastVideoId =
              getLastWatchedVideoId(
                normalized
                  .progress
                  .lastWatchedVideo
              );

            if (lastVideoId) {
              selectedVideo =
                availableVideos.find(
                  (video) =>
                    String(
                      getVideoId(video)
                    ) ===
                    String(
                      lastVideoId
                    )
                ) || null;
            }
          }

          /* -----------------------------------------------
             First unlocked video fallback
          ----------------------------------------------- */

          if (
            !selectedVideo
          ) {
            selectedVideo =
              availableVideos.find(
                (video) =>
                  !video?.isLocked
              ) || null;
          }

          if (selectedVideo) {
            setCurrentVideo(
              normalizeLearningVideo({
                video: selectedVideo,
              })
            );
          }
        } catch (err) {
          console.error(
            "Learning page error:",
            err
          );

          if (!mounted) {
            return;
          }

          /* ---------------------------------------------
             Session expired
          --------------------------------------------- */

          if (
            err?.response?.status ===
            401
          ) {
            localStorage.removeItem(
              STORAGE_KEYS.TOKEN
            );

            localStorage.removeItem(
              STORAGE_KEYS.USER
            );

            navigate(
              "/login",
              {
                replace: true,
                state: {
                  message:
                    "Your session has expired. Please login again.",
                  redirectTo:
                    COURSE_ROUTES.LEARN(
                      slug
                    ),
                },
              }
            );

            return;
          }

          /* ---------------------------------------------
             General error
          --------------------------------------------- */

          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              "Unable to load your course."
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    if (slug) {
      loadLearningData();
    }

    return () => {
      mounted = false;
    };
  }, [
    slug,
    videoId,
    navigate,
  ]);

  /* =======================================================
     ALL VIDEOS
  ======================================================= */

  /* =======================================================
     CURRENT VIDEO POSITION
  ======================================================= */

  const currentPosition =
    useMemo(() => {
      if (
        !progress ||
        !currentVideo
      ) {
        return 0;
      }

      const lastVideoId =
        getLastWatchedVideoId(
          progress.lastWatchedVideo
        );

      if (!lastVideoId) {
        return 0;
      }

      if (
        String(lastVideoId) !==
        String(
          getVideoId(
            currentVideo
          )
        )
      ) {
        return 0;
      }

      return Math.max(
        0,
        Number(
          progress.lastWatchedPosition
        ) || 0
      );
    }, [
      progress,
      currentVideo,
    ]);

  /* =======================================================
     PROGRESS UPDATED
  ======================================================= */

  const handleProgressUpdated =
    useCallback(
      (updatedProgress) => {
        if (!updatedProgress) {
          return;
        }

        setProgress(
          updatedProgress
        );

        const completedIds =
          new Set(
            Array.isArray(
              updatedProgress.completedVideos
            )
              ? updatedProgress.completedVideos.map(
                  (item) =>
                    String(
                      getVideoId(
                        item
                      )
                    )
                )
              : []
          );

        setModules(
          (previousModules) =>
            previousModules.map(
              (module) => ({
                ...module,

                videos:
                  Array.isArray(
                    module?.videos
                  )
                    ? module.videos.map(
                        (video) => ({
                          ...video,

                          isCompleted:
                            completedIds.has(
                              String(
                                getVideoId(
                                  video
                                )
                              )
                            ),
                        })
                      )
                    : [],
              })
            )
        );

        setCurrentVideo(
          (previousVideo) => {
            if (
              !previousVideo
            ) {
              return previousVideo;
            }

            const currentId =
              String(
                getVideoId(
                  previousVideo
                )
              );

            return {
              ...previousVideo,

              isCompleted:
                completedIds.has(
                  currentId
                ),
            };
          }
        );
      },
      []
    );

  /* =======================================================
     VIDEO COMPLETED
  ======================================================= */

  const handleVideoCompleted =
    useCallback(
      (updatedProgress) => {
        if (!updatedProgress) {
          return;
        }

        handleProgressUpdated(
          updatedProgress
        );
      },
      [handleProgressUpdated]
    );

  /* =======================================================
     VIDEO PROGRESS TRACKER
  ======================================================= */

  const {
    handleTimeUpdate,
    handleEnded,
    handlePause,
    handleLoadedMetadata,
  } =
    useVideoProgress({
      courseId:
        course?._id ||
        course?.id ||
        null,

      video:
        currentVideo,

      initialPosition:
        currentPosition,

      onProgressUpdated:
        handleProgressUpdated,

      onCompleted:
        handleVideoCompleted,
    });

  /* =======================================================
     VIDEO SELECTION
  ======================================================= */

  const handleVideoSelect =
    useCallback(
      (video) => {
        if (
          !video ||
          video.isLocked
        ) {
          return;
        }

        const id =
          getVideoId(video);

        if (!id) {
          return;
        }

        navigate(
          COURSE_ROUTES.VIDEO(
            slug,
            id
          )
        );
      },
      [navigate, slug]
    );

  /* =======================================================
     PREVIOUS VIDEO
  ======================================================= */

  const handlePrevious =
    useCallback(
      (video) => {
        if (!video) {
          return;
        }

        const id =
          getVideoId(video);

        if (!id) {
          return;
        }

        navigate(
          COURSE_ROUTES.VIDEO(
            slug,
            id
          )
        );
      },
      [navigate, slug]
    );

  /* =======================================================
     NEXT VIDEO
  ======================================================= */

  const handleNext =
    useCallback(
      (video) => {
        if (!video) {
          return;
        }

        const id =
          getVideoId(video);

        if (!id) {
          return;
        }

        navigate(
          COURSE_ROUTES.VIDEO(
            slug,
            id
          )
        );
      },
      [navigate, slug]
    );

  /* =======================================================
     BACK TO COURSE
  ======================================================= */

  const handleBack =
    useCallback(() => {
      navigate(
        COURSE_ROUTES.DETAILS(
          slug
        )
      );
    }, [navigate, slug]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor:
            "#ffffff",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          px: 2,
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Loading your course...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor:
            "#ffffff",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          px: 2,
        }}
      >
        <Stack
          spacing={2}
          maxWidth={520}
          width="100%"
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>

          <Button
            variant="contained"
            onClick={() =>
              navigate(
                COURSE_ROUTES.DETAILS(
                  slug
                )
              )
            }
            sx={{
              alignSelf:
                "flex-start",
              borderRadius: 2,
              fontWeight: 800,
              textTransform:
                "none",
            }}
          >
            Back to Course
          </Button>
        </Stack>
      </Box>
    );
  }

  /* =======================================================
     PLAYER
  ======================================================= */

  return (
    <CoursePlayerLayout
      course={course}
      courseTitle={
        course?.title || ""
      }
      modules={modules}
      progress={
        progress?.overallProgress ||
        0
      }
      currentVideo={
        currentVideo
      }
      currentPosition={
        currentPosition
      }
      onBack={
        handleBack
      }
      onPrevious={
        handlePrevious
      }
      onNext={
        handleNext
      }
      onVideoSelect={
        handleVideoSelect
      }
      onTimeUpdate={
        handleTimeUpdate
      }
      onLoadedMetadata={
        handleLoadedMetadata
      }
      onEnded={
        handleEnded
      }
      onPause={
        handlePause
      }
    />
  );
}

/* =========================================================
   NOT FOUND
========================================================= */

function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor:
          "#ffffff",
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        px: 3,
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        textAlign="center"
      >
        <Typography
          sx={{
            fontSize: "4rem",
            fontWeight: 900,
            color:
              "primary.main",
          }}
        >
          404
        </Typography>

        <Typography
          variant="h5"
          fontWeight={900}
        >
          Page not found
        </Typography>

        <Typography
          color="text.secondary"
        >
          The page you are looking for
          does not exist.
        </Typography>
      </Stack>
    </Box>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <CourseHome />
        }
      />

      <Route
        path="/courses/:slug"
        element={
          <CourseDetails />
        }
      />

      <Route
        path="/courses/:slug/learn"
        element={
          <CourseLearningPage />
        }
      />

      <Route
        path="/courses/:slug/learn/:videoId"
        element={
          <CourseLearningPage />
        }
      />

      <Route
        path="/courses/:slug/certificate"
        element={
          <CourseLearningPage />
        }
      />

      <Route
        path="*"
        element={
          <NotFound />
        }
      />
    </Routes>
  );
}