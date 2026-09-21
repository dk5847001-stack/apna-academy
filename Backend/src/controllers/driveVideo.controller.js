import { Readable } from "node:stream";
import Course from "../models/Course.js";
import Video from "../models/Video.js";
import Purchase from "../models/Purchase.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DRIVE_FILE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/?#]+)/i,
  /drive\.google\.com\/open\?[^#]*\bid=([^&#]+)/i,
  /drive\.google\.com\/uc\?[^#]*\bid=([^&#]+)/i,
  /docs\.google\.com\/file\/d\/([^/?#]+)/i,
];

const extractGoogleDriveFileId = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  for (const pattern of DRIVE_FILE_ID_PATTERNS) {
    const match = raw.match(pattern);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(raw)) {
    return raw;
  }

  return "";
};

const getPurchasedVideo = async (userId, courseId, videoId) => {
  const course = await Course.findOne({
    _id: courseId,
    isPublished: true,
  }).lean();

  if (!course) {
    return { error: { status: 404, message: "Course not found." } };
  }

  const purchase = await Purchase.findOne({
    user: userId,
    course: courseId,
    paymentStatus: "paid",
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  }).lean();

  if (!purchase) {
    return {
      error: {
        status: 403,
        message: "Please purchase this course first.",
      },
    };
  }

  const video = await Video.findOne({
    _id: videoId,
    course: courseId,
    isPublished: true,
  }).lean();

  if (!video) {
    return { error: { status: 404, message: "Video not found." } };
  }

  if (purchase.unlockMode !== "all_access") {
    const purchaseDate = new Date(purchase.purchasedAt);
    const now = new Date();

    const purchaseDay = new Date(
      purchaseDate.getFullYear(),
      purchaseDate.getMonth(),
      purchaseDate.getDate()
    );

    const currentDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const elapsedDays = Math.max(
      0,
      Math.floor(
        (currentDay.getTime() - purchaseDay.getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );

    const Module = (await import("../models/Module.js")).default;
    const videoModule = await Module.findById(video.module).lean();

    if (!videoModule) {
      return { error: { status: 404, message: "Video module not found." } };
    }

    if (videoModule.order > elapsedDays + 1) {
      return {
        error: {
          status: 403,
          message: "This module is still locked.",
          code: "MODULE_LOCKED",
        },
      };
    }
  }

  return { course, purchase, video };
};

const getDriveDownloadUrl = (fileId) =>
  `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;

const copyHeader = (res, source, target, name) => {
  const value = source.get(name);
  if (value) target.set(name, value);
};

export const streamDriveVideo = asyncHandler(async (req, res) => {
  const { courseId, videoId } = req.params;
  const result = await getPurchasedVideo(req.user.userId, courseId, videoId);

  if (result.error) {
    return res.status(result.error.status).json({
      success: false,
      message: result.error.message,
      ...(result.error.code ? { code: result.error.code } : {}),
    });
  }

  const { video } = result;

  if (video.videoSource !== "drive") {
    return res.status(400).json({
      success: false,
      message: "This video is not configured as a Google Drive video.",
      code: "VIDEO_SOURCE_MISMATCH",
    });
  }

  const fileId = extractGoogleDriveFileId(video.videoUrl);

  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: "Invalid Google Drive video URL.",
      code: "INVALID_DRIVE_URL",
    });
  }

  const upstreamHeaders = new Headers();
  const range = req.headers.range;

  if (range) {
    upstreamHeaders.set("Range", range);
  }

  upstreamHeaders.set("Accept", "video/mp4,video/*;q=0.9,*/*;q=0.8");

  let upstream;
  try {
    upstream = await fetch(getDriveDownloadUrl(fileId), {
      method: "GET",
      headers: upstreamHeaders,
      redirect: "follow",
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Unable to reach Google Drive.",
      code: "DRIVE_UPSTREAM_UNAVAILABLE",
    });
  }

  const contentType = upstream.headers.get("content-type") || "";

  if (!upstream.ok || contentType.includes("text/html")) {
    return res.status(502).json({
      success: false,
      message:
        "Google Drive did not return the video stream. Ensure the file is shared as Anyone with the link / Viewer.",
      code: "DRIVE_STREAM_UNAVAILABLE",
      upstreamStatus: upstream.status,
    });
  }

  res.status(upstream.status === 206 ? 206 : 200);

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", contentType || "video/mp4");
  res.setHeader("Content-Disposition", "inline");

  copyHeader(res, upstream.headers, res, "content-length");
  copyHeader(res, upstream.headers, res, "content-range");

  if (!upstream.body) {
    return res.end();
  }

  const stream = Readable.fromWeb(upstream.body);

  req.on("aborted", () => {
    stream.destroy();
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      stream.destroy();
    }
  });

  stream.on("error", () => {
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: "Google Drive video stream interrupted.",
        code: "DRIVE_STREAM_INTERRUPTED",
      });
      return;
    }

    res.destroy();
  });

  stream.pipe(res);
});
