import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  ArrowBack,
  ChevronRight,
  Close,
  DeleteOutline,
  EditOutlined,
  ExpandMore,
  Menu,
  PictureAsPdf,
  PlayCircleOutline,
  Refresh,
  Search,
  SchoolOutlined,
  VideoLibraryOutlined,
  PeopleOutline,
} from "@mui/icons-material";
import {
  createAdminCourse,
  createAdminModule,
  createAdminVideo,
  deleteAdminCourse,
  deleteAdminModule,
  deleteAdminVideo,
  getAdminCourse,
  getCurrentAdmin,
  listAdminCourses,
  updateAdminCourse,
  updateAdminModule,
  updateAdminVideo,
} from "./services/adminCourse.service";
import { getApiErrorMessage } from "./services/api";
import Students from "./pages/Students";

const emptyCourse = {
  title: "",
  category: "",
  shortDescription: "",
  description: "",
  thumbnail: "",
  previewSyllabusPdfUrl: "",
  freeResourcesUrl: "",
  level: "beginner",
  language: "English",
  instructorName: "",
  instructorAvatar: "",
  price: 0,
  allAccessPrice: 99,
  durationDays: 30,
  isPublished: false,
  isFeatured: false,
  tags: "",
};

const emptyModule = { title: "", description: "", order: 1, isPublished: true };
const emptyVideo = {
  title: "",
  description: "",
  videoUrl: "",
  bunnyVideoId: "",
  thumbnailUrl: "",
  notesPdfUrl: "",
  duration: 0,
  order: 1,
  isPreview: false,
  isPublished: true,
};

const toCoursePayload = (form) => ({
  title: form.title.trim(),
  category: form.category.trim(),
  shortDescription: form.shortDescription,
  description: form.description,
  thumbnail: form.thumbnail.trim(),
  previewSyllabusPdfUrl: form.previewSyllabusPdfUrl.trim(),
  freeResourcesUrl: form.freeResourcesUrl.trim(),
  level: form.level,
  language: form.language.trim(),
  instructor: { name: form.instructorName.trim(), avatar: form.instructorAvatar.trim() },
  price: Number(form.price) || 0,
  allAccessPrice: Number(form.allAccessPrice) || 0,
  durationDays: Math.max(Number(form.durationDays) || 1, 1),
  isPublished: Boolean(form.isPublished),
  isFeatured: Boolean(form.isFeatured),
  tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
});

const courseToForm = (course) => ({
  ...emptyCourse,
  title: course.title || "",
  category: course.category || "",
  shortDescription: course.shortDescription || "",
  description: course.description || "",
  thumbnail: course.thumbnail || "",
  previewSyllabusPdfUrl: course.previewSyllabusPdfUrl || "",
  freeResourcesUrl: course.freeResourcesUrl || "",
  level: course.level || "beginner",
  language: course.language || "English",
  instructorName: course.instructor?.name || "",
  instructorAvatar: course.instructor?.avatar || "",
  price: course.price ?? 0,
  allAccessPrice: course.allAccessPrice ?? 99,
  durationDays: course.durationDays ?? 30,
  isPublished: Boolean(course.isPublished),
  isFeatured: Boolean(course.isFeatured),
  tags: Array.isArray(course.tags) ? course.tags.join(", ") : "",
});

const moduleToForm = (module) => ({
  title: module.title || "",
  description: module.description || "",
  order: module.order || 1,
  isPublished: module.isPublished !== false,
});

const videoToForm = (video) => ({
  ...emptyVideo,
  title: video.title || "",
  description: video.description || "",
  videoUrl: video.videoUrl || "",
  bunnyVideoId: video.bunnyVideoId || "",
  thumbnailUrl: video.thumbnailUrl || "",
  notesPdfUrl: video.notesPdfUrl || "",
  duration: video.duration || 0,
  order: video.order || 1,
  isPreview: Boolean(video.isPreview),
  isPublished: video.isPublished !== false,
});

function App() {
  const [admin, setAdmin] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeSection, setActiveSection] = useState("courses");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [courseDialog, setCourseDialog] = useState(false);
  const [moduleDialog, setModuleDialog] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [moduleForm, setModuleForm] = useState(emptyModule);
  const [videoForm, setVideoForm] = useState(emptyVideo);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminCourses({ page: 1, limit: 100, search });
      setCourses(data?.courses || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load courses."));
    } finally {
      setLoading(false);
    }
  };

  const loadCourse = async (courseId) => {
    try {
      setCourseLoading(true);
      setError("");
      const data = await getAdminCourse(courseId);
      setSelectedCourse(data);
      setExpandedModules((previous) => ({ ...previous, [data.modules?.[0]?.id]: true }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load course."));
    } finally {
      setCourseLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const currentAdmin = await getCurrentAdmin();
        if (currentAdmin?.role !== "admin") {
          throw new Error("Admin access required.");
        }
        setAdmin(currentAdmin);
      } catch (err) {
        setError(getApiErrorMessage(err, "Please sign in with an administrator account."));
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (admin) loadCourses();
  }, [admin, search]);

  const dashboardStats = useMemo(() => {
    const totalVideos = courses.reduce((sum, course) => sum + Number(course.totalVideos || 0), 0);
    return {
      courses: courses.length,
      published: courses.filter((course) => course.isPublished).length,
      videos: totalVideos,
    };
  }, [courses]);

  const closeDialogs = () => {
    setCourseDialog(false);
    setModuleDialog(false);
    setVideoDialog(false);
    setEditingCourse(null);
    setEditingModule(null);
    setEditingVideo(null);
    setActiveModuleId(null);
  };

  const saveCourse = async () => {
    try {
      setSaving(true);
      const payload = toCoursePayload(courseForm);
      const data = editingCourse
        ? await updateAdminCourse(editingCourse.id, payload)
        : await createAdminCourse(payload);
      setSelectedCourse(data);
      await loadCourses();
      closeDialogs();
      setNotice(editingCourse ? "Course updated successfully." : "Course created successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save course."));
    } finally {
      setSaving(false);
    }
  };

  const saveModule = async () => {
    if (!selectedCourse) return;
    try {
      setSaving(true);
      const payload = {
        title: moduleForm.title.trim(),
        description: moduleForm.description,
        order: Math.max(Number(moduleForm.order) || 1, 1),
        isPublished: Boolean(moduleForm.isPublished),
      };
      const data = editingModule
        ? await updateAdminModule(editingModule.id, payload)
        : await createAdminModule(selectedCourse.id, payload);
      const refreshed = data?.modules ? data : await getAdminCourse(selectedCourse.id);
      setSelectedCourse(refreshed);
      closeDialogs();
      setNotice(editingModule ? "Module updated successfully." : "Module created successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save module."));
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async () => {
    if (!activeModuleId) return;
    try {
      setSaving(true);
      const payload = {
        title: videoForm.title.trim(),
        description: videoForm.description,
        videoUrl: videoForm.videoUrl.trim(),
        bunnyVideoId: videoForm.bunnyVideoId.trim(),
        thumbnailUrl: videoForm.thumbnailUrl.trim(),
        notesPdfUrl: videoForm.notesPdfUrl.trim(),
        duration: Math.max(Number(videoForm.duration) || 0, 0),
        order: Math.max(Number(videoForm.order) || 1, 1),
        isPreview: Boolean(videoForm.isPreview),
        isPublished: Boolean(videoForm.isPublished),
      };
      if (editingVideo) await updateAdminVideo(editingVideo.id, payload);
      else await createAdminVideo(activeModuleId, payload);
      await loadCourse(selectedCourse.id);
      closeDialogs();
      setNotice(editingVideo ? "Video updated successfully." : "Video added successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save video."));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (type, item) => {
    const label = type === "course" ? "course" : type === "module" ? "module" : "video";
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`)) return;
    try {
      setSaving(true);
      if (type === "course") {
        await deleteAdminCourse(item.id);
        if (selectedCourse?.id === item.id) setSelectedCourse(null);
        await loadCourses();
      } else if (type === "module") {
        await deleteAdminModule(item.id);
        await loadCourse(selectedCourse.id);
      } else {
        await deleteAdminVideo(item.id);
        await loadCourse(selectedCourse.id);
      }
      setNotice(`${label[0].toUpperCase()}${label.slice(1)} deleted successfully.`);
    } catch (err) {
      setError(getApiErrorMessage(err, `Unable to delete ${label}.`));
    } finally {
      setSaving(false);
    }
  };

  const openCreateCourse = () => {
    setCourseForm(emptyCourse);
    setEditingCourse(null);
    setCourseDialog(true);
  };

  const openEditCourse = () => {
    setCourseForm(courseToForm(selectedCourse));
    setEditingCourse(selectedCourse);
    setCourseDialog(true);
  };

  const openModule = (module = null) => {
    setEditingModule(module);
    setModuleForm(module ? moduleToForm(module) : { ...emptyModule, order: (selectedCourse?.modules?.length || 0) + 1 });
    setModuleDialog(true);
  };

  const openVideo = (module, video = null) => {
    setActiveModuleId(module.id);
    setEditingVideo(video);
    setVideoForm(video ? videoToForm(video) : { ...emptyVideo, order: (module.videos?.length || 0) + 1 });
    setVideoDialog(true);
  };

  if (error && !admin) {
    return (
      <Box className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Paper elevation={0} className="w-full max-w-lg rounded-3xl border border-slate-200 p-8 text-center">
          <SchoolOutlined className="text-blue-600" sx={{ fontSize: 52 }} />
          <Typography variant="h5" className="mt-4 font-bold text-slate-900">ApnaAcademy Admin</Typography>
          <Typography className="mt-2 text-slate-500">{error}</Typography>
          <Button variant="contained" className="mt-6" onClick={() => window.location.reload()}>Try again</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-slate-50 text-slate-900">
      <AppBar position="sticky" elevation={0} color="inherit" className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <Toolbar className="min-h-16 px-3 sm:px-6">
          <IconButton className="lg:hidden mr-2" onClick={() => setMobileOpen(true)}><Menu /></IconButton>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow-sm"><SchoolOutlined /></div>
            <div className="min-w-0">
              <Typography className="font-extrabold leading-tight truncate">ApnaAcademy</Typography>
              <Typography variant="caption" className="text-slate-500">Admin Console</Typography>
            </div>
          </div>
          <Box className="flex-1" />
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar src={admin?.avatar} className="h-9 w-9 bg-blue-100 text-blue-700">{admin?.name?.[0]}</Avatar>
            <Box className="hidden sm:block">
              <Typography variant="body2" className="font-semibold leading-tight">{admin?.name}</Typography>
              <Typography variant="caption" className="text-slate-500">Administrator</Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <div className="flex">
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} className="lg:hidden">
          <Sidebar activeSection={activeSection} onSection={(section) => { setActiveSection(section); setSelectedCourse(null); setMobileOpen(false); }} />
        </Drawer>
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-64px)]">
          <Sidebar activeSection={activeSection} onSection={(section) => { setActiveSection(section); setSelectedCourse(null); }} />
        </aside>

        <main className="flex-1 min-w-0">
          <Container maxWidth="xl" className="py-6 sm:py-8">
            {activeSection === "users" ? <Students /> : (
            {!selectedCourse ? (
              <>
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-7">
                  <div>
                    <Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Course Management</Typography>
                    <Typography className="mt-1 text-slate-500">Create, organize and publish your learning catalog.</Typography>
                  </div>
                  <Button variant="contained" startIcon={<Add />} onClick={openCreateCourse} className="rounded-xl px-5 py-2.5 normal-case font-bold shadow-sm">New Course</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <StatCard label="Total Courses" value={dashboardStats.courses} icon={<SchoolOutlined />} />
                  <StatCard label="Published" value={dashboardStats.published} icon={<PlayCircleOutline />} />
                  <StatCard label="Total Videos" value={dashboardStats.videos} icon={<VideoLibraryOutlined />} />
                </div>

                <Paper elevation={0} className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center border-b border-slate-100">
                    <TextField size="small" fullWidth placeholder="Search courses by title, slug or category..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
                    <Tooltip title="Refresh"><IconButton onClick={loadCourses}><Refresh /></IconButton></Tooltip>
                  </div>
                  {loading ? <Box className="py-20 grid place-items-center"><CircularProgress /></Box> : courses.length === 0 ? (
                    <EmptyState onCreate={openCreateCourse} />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {courses.map((course) => <CourseRow key={course.id} course={course} onOpen={() => loadCourse(course.id)} onEdit={() => { setSelectedCourse(course); }} />)}
                    </div>
                  )}
                </Paper>
              </>
            ) : (
              <>
                <Button startIcon={<ArrowBack />} onClick={() => setSelectedCourse(null)} className="mb-4 normal-case text-slate-600">Back to courses</Button>
                {courseLoading ? <Box className="py-20 grid place-items-center"><CircularProgress /></Box> : (
                  <>
                    <Paper elevation={0} className="rounded-2xl border border-slate-200 overflow-hidden mb-6">
                      <div className="p-5 sm:p-7 flex flex-col gap-5 md:flex-row md:items-center">
                        {selectedCourse.thumbnail ? <img src={selectedCourse.thumbnail} alt="" className="h-24 w-40 rounded-xl object-cover border border-slate-200" /> : <div className="h-24 w-40 rounded-xl bg-slate-100 grid place-items-center text-slate-400"><SchoolOutlined sx={{ fontSize: 38 }} /></div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 mb-2"><Chip size="small" label={selectedCourse.category} /><Chip size="small" color={selectedCourse.isPublished ? "success" : "default"} label={selectedCourse.isPublished ? "Published" : "Draft"} /></div>
                          <Typography variant="h5" className="font-extrabold text-slate-950">{selectedCourse.title}</Typography>
                          <Typography className="text-slate-500 mt-1">{selectedCourse.shortDescription || "No short description added."}</Typography>
                          <Typography variant="caption" className="text-slate-400">{selectedCourse.totalModules || 0} modules · {selectedCourse.totalVideos || 0} videos · {selectedCourse.durationDays} days</Typography>
                        </div>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Button variant="outlined" startIcon={<EditOutlined />} onClick={openEditCourse}>Edit</Button>
                          <Button color="error" variant="outlined" startIcon={<DeleteOutline />} onClick={() => confirmDelete("course", selectedCourse)}>Delete</Button>
                        </Stack>
                      </div>
                    </Paper>

                    <div className="flex items-center justify-between mb-4">
                      <div><Typography variant="h6" className="font-extrabold">Curriculum</Typography><Typography variant="body2" className="text-slate-500">Manage modules, videos and lesson notes.</Typography></div>
                      <Button variant="contained" startIcon={<Add />} onClick={() => openModule()} className="rounded-xl normal-case font-bold">Add Module</Button>
                    </div>

                    <Stack spacing={2}>
                      {(selectedCourse.modules || []).map((module) => {
                        const expanded = Boolean(expandedModules[module.id]);
                        return (
                          <Paper key={module.id} elevation={0} className="rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="p-4 sm:p-5 flex items-center gap-3">
                              <IconButton onClick={() => setExpandedModules((p) => ({ ...p, [module.id]: !expanded }))}>{expanded ? <ExpandMore /> : <ChevronRight />}</IconButton>
                              <div className="flex-1 min-w-0"><Typography className="font-bold truncate">Module {module.order}: {module.title}</Typography><Typography variant="caption" className="text-slate-500">{module.totalVideos || module.videos?.length || 0} videos</Typography></div>
                              <Chip size="small" label={module.isPublished ? "Published" : "Draft"} color={module.isPublished ? "success" : "default"} />
                              <Tooltip title="Edit module"><IconButton onClick={() => openModule(module)}><EditOutlined fontSize="small" /></IconButton></Tooltip>
                              <Tooltip title="Delete module"><IconButton color="error" onClick={() => confirmDelete("module", module)}><DeleteOutline fontSize="small" /></IconButton></Tooltip>
                            </div>
                            {expanded && <>
                              <Divider />
                              <div className="p-3 sm:p-4 bg-slate-50/60">
                                <div className="flex justify-end mb-3"><Button size="small" variant="outlined" startIcon={<Add />} onClick={() => openVideo(module)} className="normal-case">Add Video</Button></div>
                                <Stack spacing={1.5}>{(module.videos || []).map((video) => <VideoRow key={video.id} video={video} onEdit={() => openVideo(module, video)} onDelete={() => confirmDelete("video", video)} />)}{!module.videos?.length && <Typography variant="body2" className="py-6 text-center text-slate-500">No videos in this module yet.</Typography>}</Stack>
                              </div>
                            </>}
                          </Paper>
                        );
                      })}
                    </Stack>
                  </>
                )}
              </>
            )}
            )}
          </Container>
        </main>
      </div>

      <CourseDialog open={courseDialog} onClose={closeDialogs} form={courseForm} setForm={setCourseForm} saving={saving} editing={editingCourse} onSave={saveCourse} />
      <ModuleDialog open={moduleDialog} onClose={closeDialogs} form={moduleForm} setForm={setModuleForm} saving={saving} editing={editingModule} onSave={saveModule} />
      <VideoDialog open={videoDialog} onClose={closeDialogs} form={videoForm} setForm={setVideoForm} saving={saving} editing={editingVideo} onSave={saveVideo} />

      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")}><Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert></Snackbar>
      <Snackbar open={Boolean(error && admin)} autoHideDuration={5000} onClose={() => setError("")}><Alert severity="error" onClose={() => setError("")}>{error}</Alert></Snackbar>
    </Box>
  );
}

function Sidebar({ activeSection, onSection }) {
  return <div className="p-4">
    <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-5">
      <Typography className="font-bold text-blue-950">Management</Typography>
      <Typography variant="caption" className="text-blue-700">Platform administration</Typography>
    </div>
    <Stack spacing={1}>
      <Button fullWidth variant={activeSection === "courses" ? "contained" : "text"} startIcon={<SchoolOutlined />} onClick={() => onSection("courses")} className="justify-start rounded-xl normal-case font-bold">Courses</Button>
      <Button fullWidth variant={activeSection === "users" ? "contained" : "text"} startIcon={<PeopleOutline />} onClick={() => onSection("users")} className="justify-start rounded-xl normal-case font-bold">Users</Button>
    </Stack>
  </div>;
}

function StatCard({ label, value, icon }) { return <Paper elevation={0} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center justify-between"><div><Typography variant="body2" className="text-slate-500">{label}</Typography><Typography variant="h4" className="font-extrabold mt-1">{value}</Typography></div><div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">{icon}</div></div></Paper>; }

function CourseRow({ course, onOpen }) { return <button type="button" onClick={onOpen} className="w-full text-left p-4 sm:p-5 hover:bg-slate-50 transition flex items-center gap-4"><div className="h-16 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 grid place-items-center">{course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" /> : <SchoolOutlined className="text-slate-400" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Typography className="font-bold truncate">{course.title}</Typography><Chip size="small" label={course.isPublished ? "Published" : "Draft"} color={course.isPublished ? "success" : "default"} /></div><Typography variant="body2" className="text-slate-500 truncate">{course.shortDescription || "No description"}</Typography><Typography variant="caption" className="text-slate-400">{course.category} · {course.totalModules || 0} modules · {course.totalVideos || 0} videos</Typography></div><ChevronRight className="text-slate-400" /></button>; }

function VideoRow({ video, onEdit, onDelete }) { return <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 flex items-center gap-3"><div className="h-11 w-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 grid place-items-center">{video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <PlayCircleOutline className="text-slate-400" />}</div><div className="min-w-0 flex-1"><Typography variant="body2" className="font-bold truncate">{video.order}. {video.title}</Typography><div className="flex flex-wrap gap-1.5 mt-1"><Chip size="small" label={video.isPublished ? "Published" : "Draft"} color={video.isPublished ? "success" : "default"} /><Chip size="small" label={video.isPreview ? "Preview" : "Protected"} /><Chip size="small" label={`${Math.round((video.duration || 0) / 60)} min`} /></div></div>{video.notesPdfUrl && <Tooltip title="Notes PDF configured"><PictureAsPdf className="text-red-500" fontSize="small" /></Tooltip>}<IconButton onClick={onEdit}><EditOutlined fontSize="small" /></IconButton><IconButton color="error" onClick={onDelete}><DeleteOutline fontSize="small" /></IconButton></div>; }

function EmptyState({ onCreate }) { return <div className="py-20 text-center"><SchoolOutlined className="text-slate-300" sx={{ fontSize: 58 }} /><Typography variant="h6" className="font-bold mt-3">No courses found</Typography><Typography className="text-slate-500 mt-1">Create your first course to start building the curriculum.</Typography><Button variant="contained" startIcon={<Add />} onClick={onCreate} className="mt-5 rounded-xl normal-case">Create Course</Button></div>; }

function Field({ label, value, onChange, multiline = false, type = "text", ...props }) { return <TextField fullWidth label={label} value={value} onChange={(e) => onChange(e.target.value)} multiline={multiline} minRows={multiline ? 3 : undefined} type={type} {...props} />; }

function CourseDialog({ open, onClose, form, setForm, saving, editing, onSave }) { const update = (key, value) => setForm((p) => ({ ...p, [key]: value })); return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md"><DialogTitle className="flex items-center justify-between font-extrabold">{editing ? "Edit Course" : "Create Course"}<IconButton onClick={onClose}><Close /></IconButton></DialogTitle><DialogContent dividers><div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1"><Field label="Course title *" value={form.title} onChange={(v) => update("title", v)} className="md:col-span-2" /><Field label="Category *" value={form.category} onChange={(v) => update("category", v)} /><FormControl fullWidth><InputLabel>Level</InputLabel><Select label="Level" value={form.level} onChange={(e) => update("level", e.target.value)}><MenuItem value="beginner">Beginner</MenuItem><MenuItem value="intermediate">Intermediate</MenuItem><MenuItem value="advanced">Advanced</MenuItem><MenuItem value="all-levels">All levels</MenuItem></Select></FormControl><Field label="Short description" value={form.shortDescription} onChange={(v) => update("shortDescription", v)} className="md:col-span-2" /><Field label="Description" value={form.description} onChange={(v) => update("description", v)} multiline className="md:col-span-2" /><Field label="Thumbnail URL" value={form.thumbnail} onChange={(v) => update("thumbnail", v)} className="md:col-span-2" /><Field label="Preview Syllabus PDF URL" value={form.previewSyllabusPdfUrl} onChange={(v) => update("previewSyllabusPdfUrl", v)} helperText="Public PDF URL opened by the Preview Syllabus button." className="md:col-span-2" /><Field label="Free Resources URL" value={form.freeResourcesUrl} onChange={(v) => update("freeResourcesUrl", v)} helperText="Public resources page/file URL opened by the Free Resources button." className="md:col-span-2" /><Field label="Language" value={form.language} onChange={(v) => update("language", v)} /><Field label="Duration (days)" type="number" value={form.durationDays} onChange={(v) => update("durationDays", v)} /><Field label="Course price (₹)" type="number" value={form.price} onChange={(v) => update("price", v)} /><Field label="All-access price (₹)" type="number" value={form.allAccessPrice} onChange={(v) => update("allAccessPrice", v)} /><Field label="Instructor name" value={form.instructorName} onChange={(v) => update("instructorName", v)} /><Field label="Instructor avatar URL" value={form.instructorAvatar} onChange={(v) => update("instructorAvatar", v)} /><Field label="Tags (comma separated)" value={form.tags} onChange={(v) => update("tags", v)} className="md:col-span-2" /></div><Stack direction="row" spacing={2} className="mt-4"><FormControlLabel control={<Switch checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} />} label="Published" /><FormControlLabel control={<Switch checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />} label="Featured" /></Stack></DialogContent><DialogActions className="p-4"><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" onClick={onSave} disabled={saving || !form.title.trim() || !form.category.trim()}>{saving ? <CircularProgress size={20} /> : editing ? "Save Changes" : "Create Course"}</Button></DialogActions></Dialog>; }

function ModuleDialog({ open, onClose, form, setForm, saving, editing, onSave }) { const update = (key, value) => setForm((p) => ({ ...p, [key]: value })); return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm"><DialogTitle className="font-extrabold">{editing ? "Edit Module" : "Add Module"}</DialogTitle><DialogContent dividers><Stack spacing={3} className="pt-1"><Field label="Module title *" value={form.title} onChange={(v) => update("title", v)} /><Field label="Description" value={form.description} onChange={(v) => update("description", v)} multiline /><Field label="Order" type="number" value={form.order} onChange={(v) => update("order", v)} /><FormControlLabel control={<Switch checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} />} label="Published" /></Stack></DialogContent><DialogActions className="p-4"><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={onSave} disabled={saving || !form.title.trim()}>{saving ? <CircularProgress size={20} /> : "Save Module"}</Button></DialogActions></Dialog>; }

function VideoDialog({ open, onClose, form, setForm, saving, editing, onSave }) { const update = (key, value) => setForm((p) => ({ ...p, [key]: value })); return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md"><DialogTitle className="flex items-center justify-between font-extrabold">{editing ? "Edit Video" : "Add Video"}<IconButton onClick={onClose}><Close /></IconButton></DialogTitle><DialogContent dividers><div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1"><Field label="Video title *" value={form.title} onChange={(v) => update("title", v)} className="md:col-span-2" /><Field label="Description" value={form.description} onChange={(v) => update("description", v)} multiline className="md:col-span-2" /><Field label="Bunny Video ID" value={form.bunnyVideoId} onChange={(v) => update("bunnyVideoId", v)} helperText="Preferred source for the Bunny player." /><Field label="Video URL" value={form.videoUrl} onChange={(v) => update("videoUrl", v)} helperText="Optional fallback/source URL." /><Field label="Thumbnail URL" value={form.thumbnailUrl} onChange={(v) => update("thumbnailUrl", v)} className="md:col-span-2" /><Field label="Notes PDF URL" value={form.notesPdfUrl} onChange={(v) => update("notesPdfUrl", v)} helperText="Optional. Shown only when the lesson is authorized/previewable." className="md:col-span-2" /><Field label="Duration (seconds)" type="number" value={form.duration} onChange={(v) => update("duration", v)} helperText="Required for server-side 80% completion enforcement." /><Field label="Video order" type="number" value={form.order} onChange={(v) => update("order", v)} /></div><Stack direction="row" spacing={2} flexWrap="wrap" className="mt-4"><FormControlLabel control={<Switch checked={form.isPreview} onChange={(e) => update("isPreview", e.target.checked)} />} label="Preview video" /><FormControlLabel control={<Switch checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} />} label="Published" /></Stack></DialogContent><DialogActions className="p-4"><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={onSave} disabled={saving || !form.title.trim()}>{saving ? <CircularProgress size={20} /> : "Save Video"}</Button></DialogActions></Dialog>; }

export default App;
