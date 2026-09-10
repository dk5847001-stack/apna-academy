import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  PlayCircle,
  Video,
} from "lucide-react";

import api from "../services/api";

export default function VideoPreview() {
  const { slug, videoId } = useParams();

  const [course, setCourse] = useState(null);
  const [video, setVideo] = useState(null);
  const [module, setModule] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/courses/${slug}`);

        if (!response.data?.success) {
          throw new Error("Unable to load course.");
        }

        const courseData = response.data.data;

        let foundVideo = null;
        let foundModule = null;

        for (const currentModule of courseData.modules || []) {
          const currentVideo = (currentModule.videos || []).find(
            (item) =>
              String(item._id || item.id) === String(videoId)
          );

          if (currentVideo) {
            foundVideo = currentVideo;
            foundModule = currentModule;
            break;
          }
        }

        if (!foundVideo) {
          setError("Video not found.");
          return;
        }

        if (foundVideo.isLocked) {
          setError(
            "This video is locked. Please enroll in the course to continue."
          );
          return;
        }

        setCourse(courseData);
        setVideo(foundVideo);
        setModule(foundModule);
      } catch (err) {
        console.error("Preview video error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load preview video."
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug && videoId) {
      fetchCourse();
    }
  }, [slug, videoId]);

  const formatDuration = (seconds) => {
    if (!seconds || Number(seconds) <= 0) {
      return "";
    }

    const totalSeconds = Number(seconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-5 w-32 rounded bg-slate-800" />

          <div className="aspect-video rounded-3xl bg-slate-800" />

          <div className="mt-7 h-8 w-2/3 rounded bg-slate-800" />

          <div className="mt-4 h-4 w-full rounded bg-slate-800" />
          <div className="mt-2 h-4 w-4/5 rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !video || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <Video size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Preview Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error || "This video is currently unavailable."}
          </p>

          <Link
            to={`/courses/${slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold transition hover:bg-blue-500"
          >
            <ArrowLeft size={17} />
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-150px] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] right-[-150px] h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          to={`/courses/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Course
        </Link>

        {/* Video Player */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-blue-950/20">
          {video.videoUrl ? (
            <video
              className="aspect-video w-full bg-black"
              controls
              controlsList="nodownload"
              poster={
                video.thumbnailUrl ||
                course.thumbnail ||
                undefined
              }
              preload="metadata"
              playsInline
            >
              <source
                src={video.videoUrl}
                type="video/mp4"
              />

              Your browser does not support HTML5 video.
            </video>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-slate-900">
              <div className="text-center">
                <PlayCircle
                  size={52}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Video source is not available yet.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Video Information */}
        <section className="mt-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
              <PlayCircle size={14} />
              Preview Lesson
            </span>

            {module?.title && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
                {module.title}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            {video.title}
          </h1>

          {video.description && (
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400 sm:text-base">
              {video.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-5 border-y border-white/10 py-5">
            {module?.title && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <BookOpen
                  size={17}
                  className="text-blue-400"
                />
                {module.title}
              </div>
            )}

            {video.duration && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock3
                  size={17}
                  className="text-blue-400"
                />
                {formatDuration(video.duration)}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Video
                size={17}
                className="text-blue-400"
              />
              Preview Access
            </div>
          </div>
        </section>

        {/* Course CTA */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-7 sm:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black sm:text-2xl">
                Want access to the complete course?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Enroll in {course.title} to unlock the
                complete learning experience.
              </p>
            </div>

            <Link
              to={`/courses/${slug}`}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              View Course
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}