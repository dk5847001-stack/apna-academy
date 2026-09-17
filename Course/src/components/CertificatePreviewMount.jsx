import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import CertificatePreview from "../pages/CertificatePreview";
import { getCourseBySlug, normalizeCourse } from "../services/course.service";

const getCourseSlug = (pathname) => {
  const match = pathname.match(/^\/courses\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
};

export default function CertificatePreviewMount() {
  const location = useLocation();
  const slug = getCourseSlug(location.pathname);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!slug) {
      setCourse(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const load = async () => {
      try {
        setLoading(true);
        const result = await getCourseBySlug(slug);
        if (!mounted) return;

        const normalizedCourse = result?.course
          ? normalizeCourse(result.course)
          : null;

        setCourse(normalizedCourse);

        if (normalizedCourse) {
          window.dispatchEvent(
            new CustomEvent("apnaacademy-course-loaded", {
              detail: normalizedCourse,
            }),
          );
        }
      } catch (error) {
        if (mounted) setCourse(null);
        console.error("Certificate preview mount error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (!slug || loading || !course) {
    return slug && loading ? (
      <Box sx={{ minHeight: 80, display: "grid", placeItems: "center" }}>
        <CircularProgress size={22} />
      </Box>
    ) : null;
  }

  return <CertificatePreview course={course} />;
}
