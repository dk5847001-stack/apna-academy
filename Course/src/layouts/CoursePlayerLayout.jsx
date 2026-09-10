import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Menu,
  PlayCircle,
  X,
  Settings,
  Volume2,
  Maximize,
} from "lucide-react";

const demoModules = [
  {
    id: 1,
    title: "HTML Fundamentals",
    videos: [
      {
        id: 1,
        title: "Introduction to HTML",
        duration: "04:42",
        completed: true,
        locked: false,
      },
      {
        id: 2,
        title: "HTML Elements & Tags",
        duration: "04:29",
        completed: true,
        locked: false,
      },
      {
        id: 3,
        title: "Hello World",
        duration: "07:46",
        completed: false,
        locked: false,
      },
      {
        id: 4,
        title: "Paragraph Element",
        duration: "04:22",
        completed: false,
        locked: false,
      },
      {
        id: 5,
        title: "Heading Elements",
        duration: "04:38",
        completed: false,
        locked: true,
      },
    ],
  },
  {
    id: 2,
    title: "Live Session (Recordings)",
    videos: [],
  },
  {
    id: 3,
    title: "Introduction",
    videos: [],
  },
  {
    id: 4,
    title: "Prerequisites",
    videos: [],
  },
  {
    id: 5,
    title: "CSS Fundamentals",
    videos: [],
  },
];

function CoursePlayerLayout({
  courseTitle = "Full Stack Web Development",
  currentVideo = demoModules[0].videos[0],
  modules = demoModules,
  progress = 80,
  onBack,
  onPrevious,
  onNext,
  onVideoSelect,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openModule, setOpenModule] = useState(1);

  const handleVideoClick = (video) => {
    if (video.locked) return;

    onVideoSelect?.(video);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0f17] text-white">
      {/* =========================================================
          MOBILE TOP BAR
      ========================================================= */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#111722] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-white/10"
          aria-label="Open course menu"
        >
          <Menu size={21} />
        </button>

        <div className="max-w-[65%] truncate text-sm font-semibold">
          {courseTitle}
        </div>

        <div className="text-sm font-semibold text-blue-400">
          {progress}%
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] lg:h-screen">
        {/* =======================================================
            SIDEBAR OVERLAY — MOBILE
        ======================================================= */}
        {sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            aria-label="Close sidebar"
          />
        )}

        {/* =======================================================
            SIDEBAR
        ======================================================= */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-[330px] max-w-[88vw]
            flex-col border-r border-white/10 bg-[#151c28]
            shadow-2xl transition-transform duration-300
            lg:static lg:z-auto lg:w-[390px] lg:max-w-none
            lg:translate-x-0 lg:shadow-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Sidebar Header */}
          <div className="border-b border-white/10 bg-[#171f2c] px-5 pb-5 pt-5">
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                <ArrowLeft size={18} />
                Back to course
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Close course menu"
              >
                <X size={19} />
              </button>
            </div>

            <h1 className="line-clamp-2 text-xl font-bold tracking-tight text-white">
              {courseTitle}
            </h1>

            {/* Single Overall Progress */}
            <div className="mt-5 flex items-center gap-4">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="shrink-0 text-sm font-bold text-blue-400">
                {progress}%
              </span>
            </div>
          </div>

          {/* Module List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {modules.map((module) => {
              const isOpen = openModule === module.id;

              return (
                <div
                  key={module.id}
                  className="border-b border-black/10"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenModule(isOpen ? null : module.id)
                    }
                    className={`
                      flex w-full items-center justify-between px-5 py-5
                      text-left transition
                      ${
                        isOpen
                          ? "bg-indigo-500/10 text-white"
                          : "text-slate-300 hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    <span className="pr-4 text-sm font-semibold leading-6">
                      {module.id}. {module.title}
                    </span>

                    <ChevronDown
                      size={17}
                      className={`shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-indigo-400" : ""
                      }`}
                    />
                  </button>

                  {/* Videos */}
                  {isOpen && module.videos.length > 0 && (
                    <div className="bg-[#101620]">
                      {module.videos.map((video) => {
                        const active = currentVideo?.id === video.id;

                        return (
                          <button
                            type="button"
                            key={video.id}
                            disabled={video.locked}
                            onClick={() => handleVideoClick(video)}
                            className={`
                              group flex w-full items-start gap-3
                              border-l-2 px-5 py-4 text-left
                              transition
                              ${
                                active
                                  ? "border-indigo-400 bg-indigo-500/15"
                                  : "border-transparent hover:bg-white/[0.035]"
                              }
                              ${
                                video.locked
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }
                            `}
                          >
                            {/* Video Icon */}
                            <div
                              className={`
                                mt-0.5 flex h-7 w-7 shrink-0
                                items-center justify-center rounded-full
                                ${
                                  video.locked
                                    ? "bg-white/5 text-slate-500"
                                    : active
                                    ? "bg-indigo-500 text-white"
                                    : "bg-white/10 text-slate-300"
                                }
                              `}
                            >
                              {video.locked ? (
                                <Lock size={13} />
                              ) : (
                                <PlayCircle size={15} />
                              )}
                            </div>

                            {/* Video Information */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <span
                                  className={`
                                    line-clamp-2 text-sm font-medium leading-5
                                    ${
                                      active
                                        ? "text-white"
                                        : "text-slate-300"
                                    }
                                  `}
                                >
                                  {video.title}
                                </span>

                                <span className="shrink-0 text-[11px] text-slate-500">
                                  {video.duration}
                                </span>
                              </div>

                              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                {video.completed && !video.locked ? (
                                  <>
                                    <Check
                                      size={13}
                                      className="text-emerald-400"
                                      strokeWidth={3}
                                    />
                                    <span className="text-emerald-400">
                                      Completed
                                    </span>
                                  </>
                                ) : video.locked ? (
                                  <span className="text-slate-500">
                                    Locked
                                  </span>
                                ) : (
                                  <span className="text-slate-500">
                                    Video
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* =======================================================
            MAIN PLAYER AREA
        ======================================================= */}
        <main className="flex min-w-0 flex-1 flex-col bg-[#080b11]">
          {/* Desktop Navigation */}
          <div className="hidden h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#151a22] px-7 lg:flex">
            <button
              type="button"
              onClick={onPrevious}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="max-w-[45%] truncate text-sm font-semibold text-slate-200">
              {currentVideo?.title || "Course Player"}
            </div>

            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Video Container */}
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex h-full w-full flex-col bg-black">
              {/* Video */}
              <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl">
                      <PlayCircle
                        size={42}
                        strokeWidth={1.4}
                        className="text-indigo-400"
                      />
                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-400">
                      {currentVideo?.title || "Select a video"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Course video player
                    </p>
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="border-t border-white/5 bg-black px-4 py-3 sm:px-6">
                {/* Progress timeline */}
                <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[3%] rounded-full bg-indigo-500" />
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <button
                    type="button"
                    className="transition hover:text-white"
                    aria-label="Play"
                  >
                    <PlayCircle size={22} />
                  </button>

                  <span className="hidden text-xs sm:block">
                    00:01 / {currentVideo?.duration || "00:00"}
                  </span>

                  <div className="flex-1" />

                  <button
                    type="button"
                    className="transition hover:text-white"
                    aria-label="Settings"
                  >
                    <Settings size={19} />
                  </button>

                  <button
                    type="button"
                    className="hidden transition hover:text-white sm:block"
                    aria-label="Volume"
                  >
                    <Volume2 size={19} />
                  </button>

                  <button
                    type="button"
                    className="transition hover:text-white"
                    aria-label="Fullscreen"
                  >
                    <Maximize size={19} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Previous / Next */}
          <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#111722] px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={onPrevious}
              className="flex items-center gap-1 text-sm text-slate-300 transition hover:text-white"
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-1 text-sm text-slate-300 transition hover:text-white"
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CoursePlayerLayout;