import { useMemo, useState } from "react";

import {
  ArrowLeft,
  Check,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Description,
  Download,
  Lock,
  Menu,
  PlayCircle,
  X,
  Quiz,
  WorkspacePremium,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import BunnyVideoPlayer from "../components/BunnyVideoPlayer";

const getVideoId = (video) => video?._id || video?.id || "";
const getVideoTitle = (video) => video?.title || "Untitled lesson";
const getVideoDuration = (video) => {
  const duration = Number(video?.duration);
  if (!Number.isFinite(duration) || duration <= 0) return "";
  return `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`;
};
const isVideoLocked = (video) => Boolean(video?.isLocked ?? video?.locked);
const isVideoCompleted = (video) => Boolean(video?.isCompleted ?? video?.completed);
const getNotesPdfUrl = (video) => (typeof video?.notesPdfUrl === "string" ? video.notesPdfUrl.trim() : "");

const normalizeMediaValue = (value) => (typeof value === "string" ? value.trim() : "");
const isEmptyMediaValue = (value) => {
  const normalized = normalizeMediaValue(value).toLowerCase();
  return !normalized || ["null", "undefined", "none", "n/a", "na", "#"].includes(normalized);
};
const hasVideoSource = (video) => {
  if (!video) return false;

  // Explicit PDF/content-type flags always take precedence over generic media fields.
  if (video?.isPdfOnly === true || video?.pdfOnly === true) return false;
  if (["pdf", "document", "notes"].includes(normalizeMediaValue(video?.contentType).toLowerCase())) return false;
  if (["pdf", "document", "notes"].includes(normalizeMediaValue(video?.type).toLowerCase())) return false;

  const videoUrl = normalizeMediaValue(video?.videoUrl);
  const bunnyVideoId = normalizeMediaValue(video?.bunnyVideoId);
  const notesPdfUrl = getNotesPdfUrl(video);

  // Treat placeholder values and a PDF URL accidentally stored in videoUrl as non-video content.
  if (isEmptyMediaValue(videoUrl) && isEmptyMediaValue(bunnyVideoId)) return false;
  if (notesPdfUrl && videoUrl && videoUrl === notesPdfUrl && isEmptyMediaValue(bunnyVideoId)) return false;
  if (/\.pdf(?:$|[?#])/i.test(videoUrl) && isEmptyMediaValue(bunnyVideoId)) return false;

  return !isEmptyMediaValue(videoUrl) || !isEmptyMediaValue(bunnyVideoId);
};

const getUnlockDaysRemaining = ({ moduleOrder, purchasedAt, unlockMode }) => {
  if (unlockMode === "all_access" || !purchasedAt) return null;

  const order = Number(moduleOrder);
  const purchaseDate = new Date(purchasedAt);
  if (!Number.isFinite(order) || order <= 0 || Number.isNaN(purchaseDate.getTime())) return null;

  const purchaseDay = new Date(
    purchaseDate.getFullYear(),
    purchaseDate.getMonth(),
    purchaseDate.getDate()
  );
  const currentDate = new Date();
  const currentDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const unlockDay = new Date(purchaseDay);
  unlockDay.setDate(unlockDay.getDate() + Math.max(0, order - 1));

  return Math.max(
    0,
    Math.ceil((unlockDay.getTime() - currentDay.getTime()) / (24 * 60 * 60 * 1000))
  );
};

const COLORS = {
  page: "#0b1220",
  panel: "#111827",
  panelSoft: "#172033",
  lesson: "#20252d",
  lessonHover: "#29313c",
  border: "#303949",
  white: "#ffffff",
  muted: "#94a3b8",
  blue: "#2563eb",
  active: "#4f63d7",
};

export default function CoursePlayerLayout({
  course = null,
  courseTitle = "",
  courseId = "",
  modules = [],
  access = null,
  progress = 0,
  currentVideo = null,
  currentPosition = 0,
  courseCompleted = false,
  onAssessment,
  onCertificate,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModules, setOpenModules] = useState({});
  const normalizedProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const safeModules = useMemo(() => (Array.isArray(modules) ? modules : []), [modules]);
  const allVideos = useMemo(
    () => safeModules.flatMap((module) => (Array.isArray(module?.videos) ? module.videos : [])),
    [safeModules]
  );

  const currentVideoIndex = currentVideo
    ? allVideos.findIndex((video) => String(getVideoId(video)) === String(getVideoId(currentVideo)))
    : -1;

  const previousVideo = useMemo(() => {
    if (currentVideoIndex <= 0) return null;
    for (let index = currentVideoIndex - 1; index >= 0; index -= 1) {
      if (!isVideoLocked(allVideos[index])) return allVideos[index];
    }
    return null;
  }, [allVideos, currentVideoIndex]);

  const nextVideo = useMemo(() => {
    if (currentVideoIndex < 0 || currentVideoIndex >= allVideos.length - 1) return null;
    for (let index = currentVideoIndex + 1; index < allVideos.length; index += 1) {
      if (!isVideoLocked(allVideos[index])) return allVideos[index];
    }
    return null;
  }, [allVideos, currentVideoIndex]);

  const notesPdfUrl = getNotesPdfUrl(currentVideo);

  const handleVideoClick = (video) => {
    if (!video || isVideoLocked(video)) return;
    onVideoSelect?.(video);
    setSidebarOpen(false);
  };

  const renderSidebarContent = (mobile = false) => (
    <Box sx={{ width: mobile ? "min(390px, 92vw)" : { lg: 390, xl: 430 }, height: "100%", display: "flex", flexDirection: "column", backgroundColor: COLORS.white }}>
      <Box sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 2.5, sm: 3 }, backgroundColor: "#343d4b", color: COLORS.white, borderBottom: "1px solid #4a5565" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Button variant="text" startIcon={<ArrowLeft />} onClick={onBack} sx={{ textTransform: "none", fontWeight: 700, color: "#ffffff", px: 0, minWidth: 0, "&:hover": { backgroundColor: "transparent", color: "#dbeafe" } }}>Back to course page</Button>
          {mobile && <IconButton onClick={() => setSidebarOpen(false)} aria-label="Close course menu" sx={{ color: "#fff" }}><X /></IconButton>}
        </Stack>
        <Typography sx={{ mt: 2.5, fontSize: { xs: "1.15rem", sm: "1.35rem" }, fontWeight: 800, lineHeight: 1.3, color: "#ffffff" }}>{courseTitle || course?.title || "Course"}</Typography>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 2.5 }}>
          <LinearProgress variant="determinate" value={normalizedProgress} sx={{ flex: 1, height: 5, borderRadius: 999, backgroundColor: "#5c6677", "& .MuiLinearProgress-bar": { borderRadius: 999, backgroundColor: "#7184e7" } }} />
          <Typography sx={{ color: "#ffffff", fontSize: "0.8rem", fontWeight: 800, minWidth: 30 }}>{Math.round(normalizedProgress)}%</Typography>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", backgroundColor: COLORS.white }}>
        {safeModules.length === 0 ? (
          <Box sx={{ p: 3 }}><Typography variant="body2" color="text.secondary">No course modules available.</Typography></Box>
        ) : (
          safeModules.map((module, moduleIndex) => {
            const moduleKey = module?._id || module?.order || module?.id || moduleIndex + 1;
            const isOpen = Boolean(openModules[String(moduleKey)]);
            const moduleVideos = Array.isArray(module?.videos) ? module.videos : [];
            const completedCount = moduleVideos.filter(isVideoCompleted).length;
            const moduleOrder = Number(module?.order) || moduleIndex + 1;
            const moduleUnlockDays = getUnlockDaysRemaining({
              moduleOrder,
              purchasedAt: access?.purchasedAt,
              unlockMode: access?.unlockMode,
            });
            return (
              <Box key={module?._id || moduleKey} sx={{ borderBottom: "1px solid #e2e8f0" }}>
                <Button fullWidth onClick={() => setOpenModules((previous) => ({ ...previous, [String(moduleKey)]: !isOpen }))} sx={{ minHeight: 66, px: { xs: 2.25, sm: 2.75 }, py: 1.5, justifyContent: "space-between", textAlign: "left", textTransform: "none", color: "#334155", backgroundColor: COLORS.white, borderRadius: 0, borderLeft: "4px solid transparent", "&:hover": { backgroundColor: "#f8fafc" }, "&:focus-visible": { outline: "none" } }}>
                  <Box sx={{ minWidth: 0, pr: 1.5 }}>
                    <Typography sx={{ fontSize: { xs: "0.88rem", sm: "0.93rem" }, fontWeight: 400, lineHeight: 1.35, color: "#334155" }}>{moduleIndex + 1}. {module?.title || "Module"}</Typography>
                    <Typography sx={{ mt: 0.4, fontSize: "0.68rem", color: "#94a3b8", fontWeight: 500 }}>{moduleVideos.length} lesson{moduleVideos.length === 1 ? "" : "s"}{completedCount > 0 ? ` • ${completedCount} completed` : ""}</Typography>
                  </Box>
                  <ExpandMore sx={{ flexShrink: 0, color: "#64748b", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms ease" }} />
                </Button>
                {isOpen && moduleVideos.length > 0 && (
                  <Box sx={{ backgroundColor: COLORS.lesson }}>
                    {moduleVideos.map((video) => {
                      const active = String(getVideoId(currentVideo)) === String(getVideoId(video));
                      const locked = isVideoLocked(video);
                      const completed = isVideoCompleted(video);
                      const pdfOnly = Boolean(getNotesPdfUrl(video)) && !hasVideoSource(video);
                      return (
                        <Button key={getVideoId(video)} fullWidth disabled={locked} onClick={() => handleVideoClick(video)} sx={{ minHeight: 70, pl: { xs: 2.25, sm: 2.75 }, pr: { xs: 2.25, sm: 2.75 }, py: 1.35, justifyContent: "flex-start", alignItems: "center", gap: 1.3, textAlign: "left", textTransform: "none", borderRadius: 0, borderTop: "1px solid rgba(255,255,255,0.045)", borderLeft: "4px solid transparent", backgroundColor: active ? "#29313c" : COLORS.lesson, color: locked ? "#64748b" : "#ffffff", transition: "background-color 180ms ease", "&:hover": { backgroundColor: locked ? COLORS.lesson : COLORS.lessonHover, "& .course-video-title": { transform: locked ? "translateX(0)" : "translateX(6px)" } }, "&:focus": { outline: "none", boxShadow: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" }, "&.Mui-focusVisible": { backgroundColor: active ? "#29313c" : COLORS.lesson, boxShadow: "none", outline: "none" }, "&.Mui-disabled": { color: "#64748b", opacity: 1 } }}>
                          <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: completed ? "#16351f" : active ? "#33427a" : "#303844", border: "1px solid", borderColor: completed ? "#3b8150" : active ? "#6274d0" : "#4a5565" }}>
                            {completed ? <Check sx={{ fontSize: 17, color: "#69d58a" }} /> : locked ? <Lock sx={{ fontSize: 15, color: "#94a3b8" }} /> : pdfOnly ? <Description sx={{ fontSize: 18, color: active ? "#9caaf8" : "#e2e8f0" }} /> : <PlayCircle sx={{ fontSize: 18, color: active ? "#9caaf8" : "#e2e8f0" }} />}
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography className="course-video-title" sx={{ display: "block", transform: "translateX(0)", transition: "transform 180ms ease", fontSize: { xs: "0.78rem", sm: "0.82rem" }, fontWeight: active ? 800 : 650, color: locked ? "#64748b" : "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", willChange: "transform" }}>{getVideoTitle(video)}</Typography>
                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.45 }}>
                              <Typography sx={{ fontSize: "0.64rem", color: locked ? "#64748b" : "#a8b2c1" }}>{pdfOnly ? "PDF" : "video"}</Typography>
                              {video?.isPreview && <Chip label="Preview" size="small" sx={{ height: 18, color: "#bfdbfe", backgroundColor: "#1e3a5f", fontSize: "0.58rem", fontWeight: 700 }} />}
                            </Stack>
                          </Box>
                          {locked && moduleUnlockDays !== null ? (
                            <Chip
                              icon={<WorkspacePremium sx={{ fontSize: 15 }} />}
                              label={`Unlocks in ${moduleUnlockDays} day${moduleUnlockDays === 1 ? "" : "s"}`}
                              size="small"
                              sx={{
                                flexShrink: 0,
                                height: 26,
                                maxWidth: { xs: 118, sm: 142 },
                                color: "#dbeafe",
                                background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",
                                border: "1px solid rgba(147,197,253,0.35)",
                                borderRadius: 999,
                                fontSize: { xs: "0.53rem", sm: "0.58rem" },
                                fontWeight: 800,
                                letterSpacing: "0.01em",
                                "& .MuiChip-icon": { color: "#bfdbfe", ml: 0.65 },
                                "& .MuiChip-label": { px: 0.8, overflow: "hidden", textOverflow: "ellipsis" },
                              }}
                            />
                          ) : getVideoDuration(video) ? (
                            <Typography sx={{ flexShrink: 0, fontSize: "0.68rem", color: locked ? "#64748b" : "#a8b2c1", fontWeight: 700 }}>{getVideoDuration(video)}</Typography>
                          ) : null}
                        </Button>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: COLORS.page, color: COLORS.white, overflow: "hidden" }}>
      <Box sx={{ display: { xs: "flex", lg: "none" }, height: 60, alignItems: "center", justifyContent: "space-between", px: 1.25, backgroundColor: "#111827", borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 20 }}>
        <IconButton onClick={() => setSidebarOpen(true)} aria-label="Open course menu" sx={{ color: "#fff" }}><Menu /></IconButton>
        <Typography sx={{ maxWidth: "72%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 800, fontSize: "0.9rem" }}>{courseTitle || course?.title || "Course"}</Typography>
        <Box sx={{ width: 40 }} />
      </Box>
      <Box sx={{ display: "flex", minHeight: { xs: "calc(100vh - 60px)", lg: "100vh" } }}>
        <Box component="aside" sx={{ display: { xs: "none", lg: "block" }, width: { lg: 390, xl: 430 }, flexShrink: 0, backgroundColor: COLORS.white, boxShadow: "8px 0 28px rgba(0,0,0,0.12)", position: "relative", zIndex: 4 }}>{renderSidebarContent(false)}</Box>
        <Box component="main" sx={{ minWidth: 0, flex: 1, backgroundColor: COLORS.page }}>
          <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", p: { xs: 0.75, sm: 1.5, lg: 2.5, xl: 3.5 } }}>
            <Paper elevation={0} sx={{ flex: 1, overflow: "hidden", border: `1px solid ${COLORS.border}`, borderRadius: { xs: 1.5, sm: 2.5 }, backgroundColor: "#0f172a", boxShadow: "0 20px 55px rgba(0,0,0,0.3)" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: { xs: 48, sm: 54 }, px: { xs: 1.5, sm: 2.5 }, columnGap: { xs: 2, sm: 3, md: 4 }, backgroundColor: "#111827", borderBottom: `1px solid ${COLORS.border}` }}>
                <Button variant="text" startIcon={<ChevronLeft />} onClick={() => previousVideo && onPrevious?.(previousVideo)} disabled={!previousVideo} sx={{ color: "#e2e8f0", textTransform: "none", fontWeight: 700, minWidth: 0, "&.Mui-disabled": { color: "#475569" } }}>previous</Button>
                <Button variant="text" endIcon={<ChevronRight />} onClick={() => nextVideo && onNext?.(nextVideo)} disabled={!nextVideo} sx={{ color: "#e2e8f0", textTransform: "none", fontWeight: 700, minWidth: 0, "&.Mui-disabled": { color: "#475569" } }}>next</Button>
              </Stack>
              <Box sx={{ backgroundColor: "#000000", width: "100%" }}>
                <BunnyVideoPlayer
                  key={`${getVideoId(currentVideo)}-${currentVideo?.videoSource || "bunny"}-${currentVideo?.videoUrl || ""}-${currentVideo?.bunnyVideoId || ""}`}
                  video={currentVideo}
                  courseId={courseId}
                  currentTime={currentPosition}
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onLoadedMetadata}
                  onEnded={onEnded}
                  onPlay={onPlay}
                  onPause={onPause}
                />
              </Box>
              <Box sx={{ backgroundColor: "#111827", px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2.25 } }}>
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1.5}><Box sx={{ minWidth: 0 }}><Typography sx={{ color: "#7184e7", fontSize: "0.64rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.13em" }}>Now learning</Typography><Typography sx={{ mt: 0.45, color: "#ffffff", fontWeight: 850, fontSize: { xs: "0.95rem", sm: "1.05rem" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getVideoTitle(currentVideo)}</Typography></Box></Stack>
                {notesPdfUrl && <Paper variant="outlined" sx={{ mt: 2, p: { xs: 1.25, sm: 1.5 }, borderRadius: 2, borderColor: COLORS.border, backgroundColor: COLORS.panel }}><Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between"><Stack direction="row" spacing={1} alignItems="center"><Description sx={{ color: "#93c5fd", fontSize: 20 }} /><Box><Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 800 }}>Lesson Notes</Typography><Typography sx={{ color: "#94a3b8", fontSize: "0.66rem" }}>PDF notes for this lesson</Typography></Box></Stack><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button component="a" href={notesPdfUrl} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<Description />} sx={{ textTransform: "none", fontWeight: 800, color: "#dbeafe", borderColor: "#475569" }}>View Notes</Button><Button component="a" href={notesPdfUrl} target="_blank" rel="noopener noreferrer" variant="contained" startIcon={<Download />} sx={{ textTransform: "none", fontWeight: 800 }}>Open PDF</Button></Stack></Stack></Paper>}
                {courseCompleted && <Alert severity="success" icon={<Check />} sx={{ mt: 2, borderRadius: 2, backgroundColor: "#10251a", color: "#dcfce7", border: "1px solid #245d37", "& .MuiAlert-icon": { color: "#69d58a" } }}><Typography fontWeight={800}>Course completed!</Typography><Typography variant="body2">You have finished all required lessons. Continue to the assessment and certificate.</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.25 }}><Button variant="contained" startIcon={<Quiz />} onClick={onAssessment} sx={{ textTransform: "none", fontWeight: 800 }}>Take Assessment</Button><Button variant="outlined" startIcon={<WorkspacePremium />} onClick={onCertificate} sx={{ textTransform: "none", fontWeight: 800, color: "#dcfce7", borderColor: "#3b8150" }}>Certificate</Button></Stack></Alert>}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} ModalProps={{ keepMounted: true }}>{renderSidebarContent(true)}</Drawer>
    </Box>
  );
}
