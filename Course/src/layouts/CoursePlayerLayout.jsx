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
  Divider,
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

export default function CoursePlayerLayout({
  course = null,
  courseTitle = "",
  modules = [],
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
  const [openModule, setOpenModule] = useState(modules?.[0]?.order ?? modules?.[0]?.id ?? null);
  const normalizedProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const safeModules = useMemo(() => (Array.isArray(modules) ? modules : []), [modules]);
  const allVideos = useMemo(() => safeModules.flatMap((module) => (Array.isArray(module?.videos) ? module.videos : [])), [safeModules]);
  const currentVideoIndex = currentVideo ? allVideos.findIndex((video) => String(getVideoId(video)) === String(getVideoId(currentVideo))) : -1;
  const previousVideo = useMemo(() => {
    if (currentVideoIndex <= 0) return null;
    for (let index = currentVideoIndex - 1; index >= 0; index -= 1) if (!isVideoLocked(allVideos[index])) return allVideos[index];
    return null;
  }, [allVideos, currentVideoIndex]);
  const nextVideo = useMemo(() => {
    if (currentVideoIndex < 0 || currentVideoIndex >= allVideos.length - 1) return null;
    for (let index = currentVideoIndex + 1; index < allVideos.length; index += 1) if (!isVideoLocked(allVideos[index])) return allVideos[index];
    return null;
  }, [allVideos, currentVideoIndex]);
  const notesPdfUrl = getNotesPdfUrl(currentVideo);

  const handleVideoClick = (video) => {
    if (!video || isVideoLocked(video)) return;
    onVideoSelect?.(video);
    setSidebarOpen(false);
  };

  const renderSidebarContent = (mobile = false) => (
    <Box sx={{ width: mobile ? "min(390px, 90vw)" : 370, height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: "1px solid #e5e7eb" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Button variant="text" startIcon={<ArrowLeft />} onClick={onBack} sx={{ textTransform: "none", fontWeight: 700, color: "#334155", px: 0 }}>Back to course</Button>
          {mobile && <IconButton onClick={() => setSidebarOpen(false)} aria-label="Close course menu"><X /></IconButton>}
        </Stack>
        <Typography sx={{ mt: 2, fontSize: { xs: "1.05rem", sm: "1.15rem" }, fontWeight: 800, lineHeight: 1.35, color: "#0f172a" }}>{courseTitle || course?.title || "Course"}</Typography>
        <Box sx={{ mt: 2.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.8 }}><Typography variant="caption" fontWeight={700} color="text.secondary">Overall progress</Typography><Typography variant="caption" fontWeight={800} color="primary.main">{Math.round(normalizedProgress)}%</Typography></Stack>
          <LinearProgress variant="determinate" value={normalizedProgress} sx={{ height: 7, borderRadius: 99, backgroundColor: "#e2e8f0", "& .MuiLinearProgress-bar": { borderRadius: 99 } }} />
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {safeModules.length === 0 ? <Box sx={{ p: 3 }}><Typography variant="body2" color="text.secondary">No course modules available.</Typography></Box> : safeModules.map((module, moduleIndex) => {
          const moduleKey = module?.order ?? module?.id ?? moduleIndex + 1;
          const isOpen = String(openModule) === String(moduleKey);
          const moduleVideos = Array.isArray(module?.videos) ? module.videos : [];
          return <Box key={module?._id || moduleKey} sx={{ borderBottom: "1px solid #e5e7eb" }}>
            <Button fullWidth onClick={() => setOpenModule(isOpen ? null : moduleKey)} sx={{ px: 2.5, py: 2, justifyContent: "space-between", textAlign: "left", textTransform: "none", color: "#0f172a", backgroundColor: isOpen ? "#eff6ff" : "#ffffff", borderRadius: 0 }}>
              <Box sx={{ minWidth: 0, pr: 1 }}><Typography sx={{ fontSize: "0.92rem", fontWeight: 800 }}>{moduleIndex + 1}. {module?.title || "Module"}</Typography><Typography variant="caption" color="text.secondary">{moduleVideos.length} lesson{moduleVideos.length === 1 ? "" : "s"}</Typography></Box><ExpandMore sx={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </Button>
            {isOpen && moduleVideos.length > 0 && <Box sx={{ backgroundColor: "#f8fafc" }}>{moduleVideos.map((video) => {
              const active = String(getVideoId(currentVideo)) === String(getVideoId(video));
              const locked = isVideoLocked(video);
              const completed = isVideoCompleted(video);
              return <Button key={getVideoId(video)} fullWidth disabled={locked} onClick={() => handleVideoClick(video)} sx={{ minHeight: 68, px: 2.5, py: 1.25, justifyContent: "flex-start", alignItems: "flex-start", gap: 1.25, textAlign: "left", textTransform: "none", borderRadius: 0, borderLeft: active ? "3px solid #2563eb" : "3px solid transparent", backgroundColor: active ? "#dbeafe" : "transparent", color: locked ? "#94a3b8" : "#334155" }}>
                <Box sx={{ width: 30, height: 30, mt: 0.1, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: completed ? "#dcfce7" : locked ? "#e2e8f0" : active ? "#dbeafe" : "#ffffff", border: "1px solid", borderColor: completed ? "#bbf7d0" : active ? "#bfdbfe" : "#e2e8f0" }}>{completed ? <Check sx={{ fontSize: 17, color: "#16a34a" }} /> : locked ? <Lock sx={{ fontSize: 16 }} /> : <PlayCircle sx={{ fontSize: 18, color: active ? "#2563eb" : "#64748b" }} />}</Box>
                <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontSize: "0.86rem", fontWeight: active ? 800 : 600 }}>{getVideoTitle(video)}</Typography><Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.4 }}>{video?.isPreview && <Chip label="Preview" size="small" sx={{ height: 20, fontSize: "0.65rem" }} />}{getVideoDuration(video) && <Typography variant="caption" color="text.secondary">{getVideoDuration(video)}</Typography>}</Stack></Box>
              </Button>;
            })}</Box>}
          </Box>;
        })}
      </Box>
    </Box>
  );

  return <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a" }}>
    <Box sx={{ display: { xs: "flex", lg: "none" }, height: 64, alignItems: "center", justifyContent: "space-between", px: 1.5, backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 20 }}><IconButton onClick={() => setSidebarOpen(true)} aria-label="Open course menu"><Menu /></IconButton><Typography sx={{ maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 800 }}>{courseTitle || course?.title || "Course"}</Typography><Box sx={{ width: 40 }} /></Box>
    <Box sx={{ display: "flex", minHeight: { xs: "calc(100vh - 64px)", lg: "100vh" } }}>
      <Box component="aside" sx={{ display: { xs: "none", lg: "block" }, width: 370, flexShrink: 0, borderRight: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>{renderSidebarContent(false)}</Box>
      <Box component="main" sx={{ minWidth: 0, flex: 1 }}><Box sx={{ p: { xs: 1.25, sm: 2.5, lg: 3.5 }, maxWidth: 1280, mx: "auto" }}>
        <Paper elevation={0} sx={{ overflow: "hidden", border: "1px solid #e5e7eb", borderRadius: { xs: 2, md: 3 }, backgroundColor: "#ffffff" }}>
          <BunnyVideoPlayer video={currentVideo} currentTime={currentPosition} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={onEnded} onPlay={onPlay} onPause={onPause} />
          <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Stack spacing={1.25}><Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 900 }}>Now learning</Typography><Typography variant="h5" sx={{ fontWeight: 900 }}>{getVideoTitle(currentVideo)}</Typography><Typography variant="body2" color="text.secondary">Watch at least 80% of this lesson to mark it complete.</Typography></Stack>
            {notesPdfUrl && <Paper variant="outlined" sx={{ mt: 2.5, p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, borderColor: "#dbeafe", backgroundColor: "#f8fbff" }}><Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between"><Stack direction="row" spacing={1.25} alignItems="center"><Description /><Box><Typography sx={{ fontWeight: 800 }}>Lesson Notes</Typography><Typography variant="caption" color="text.secondary">PDF notes for this lesson</Typography></Box></Stack><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button component="a" href={notesPdfUrl} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<Description />} sx={{ textTransform: "none", fontWeight: 800 }}>View Notes</Button><Button component="a" href={notesPdfUrl} target="_blank" rel="noopener noreferrer" variant="contained" startIcon={<Download />} sx={{ textTransform: "none", fontWeight: 800 }}>Open PDF</Button></Stack></Stack></Paper>}
            <Divider sx={{ my: 2.5 }} />
            {courseCompleted && <Alert severity="success" icon={<Check />} sx={{ mb: 2.5, borderRadius: 2.5 }}><Typography fontWeight={800}>Course completed!</Typography><Typography variant="body2">You have finished all required lessons. Continue to the assessment and certificate.</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 1.5 }}><Button variant="contained" startIcon={<Quiz />} onClick={onAssessment} sx={{ textTransform: "none", fontWeight: 800 }}>Take Assessment</Button><Button variant="outlined" startIcon={<WorkspacePremium />} onClick={onCertificate} sx={{ textTransform: "none", fontWeight: 800 }}>Certificate</Button></Stack></Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between"><Button variant="outlined" startIcon={<ChevronLeft />} onClick={() => previousVideo && onPrevious?.(previousVideo)} disabled={!previousVideo} sx={{ textTransform: "none", fontWeight: 800, minHeight: 44, width: { xs: "100%", sm: "auto" } }}>Previous</Button><Button variant="contained" endIcon={<ChevronRight />} onClick={() => nextVideo && onNext?.(nextVideo)} disabled={!nextVideo} sx={{ textTransform: "none", fontWeight: 800, minHeight: 44, width: { xs: "100%", sm: "auto" } }}>Next lesson</Button></Stack>
          </Box>
        </Paper>
      </Box></Box>
    </Box>
    <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} ModalProps={{ keepMounted: true }}>{renderSidebarContent(true)}</Drawer>
  </Box>;
}
