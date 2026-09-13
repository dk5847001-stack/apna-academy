import "dotenv/config";
import mongoose from "mongoose";

import Course from "../src/models/Course.js";
import Module from "../src/models/Module.js";
import Video from "../src/models/Video.js";

const MONGO_URI = process.env.MONGO_URI;

const courseData = {
  title: "Full Stack Web Development",
  slug: "full-stack-web-development",
  shortDescription:
    "Learn modern web development from HTML and CSS to JavaScript and full-stack application development.",
  description:
    "A practical Full Stack Web Development course covering frontend fundamentals, modern JavaScript, backend development, databases, APIs and complete web application development.",
  thumbnail:
    "https://placehold.co/1280x720/0f172a/ffffff?text=Full+Stack+Web+Development",
  category: "Web Development",
  level: "beginner",
  language: "English",
  instructor: {
    name: "ApnaAcademy",
    avatar: "",
  },
  price: 1,
  allAccessPrice: 99,
  durationDays: 30,
  isPublished: true,
  isFeatured: true,
  tags: [
    "HTML",
    "CSS",
    "JavaScript",
    "Web Development",
    "Full Stack",
  ],
  totalModules: 3,
  totalVideos: 9,
};

const moduleData = [
  {
    title: "HTML",
    description:
      "Learn the fundamentals of HTML and build the structure of modern web pages.",
    order: 1,
    videos: [
      {
        title: "Introduction to HTML",
        description:
          "Understand what HTML is and how it is used to create web pages.",
        order: 1,
        duration: 420,
      },
      {
        title: "HTML Elements and Attributes",
        description:
          "Learn common HTML elements, attributes and document structure.",
        order: 2,
        duration: 540,
      },
      {
        title: "HTML Forms",
        description:
          "Learn how forms, inputs and form controls work in HTML.",
        order: 3,
        duration: 600,
      },
    ],
  },
  {
    title: "CSS",
    description:
      "Learn CSS fundamentals and create responsive and attractive web interfaces.",
    order: 2,
    videos: [
      {
        title: "Introduction to CSS",
        description:
          "Understand CSS syntax, selectors and basic styling.",
        order: 1,
        duration: 480,
      },
      {
        title: "CSS Selectors",
        description:
          "Learn different CSS selectors and how to target HTML elements.",
        order: 2,
        duration: 540,
      },
      {
        title: "Flexbox",
        description:
          "Learn CSS Flexbox for creating flexible and responsive layouts.",
        order: 3,
        duration: 720,
      },
    ],
  },
  {
    title: "JavaScript",
    description:
      "Learn JavaScript fundamentals and the programming concepts required for modern web development.",
    order: 3,
    videos: [
      {
        title: "Introduction to JavaScript",
        description:
          "Understand JavaScript and how it adds functionality to web pages.",
        order: 1,
        duration: 510,
      },
      {
        title: "Variables and Data Types",
        description:
          "Learn JavaScript variables, constants and common data types.",
        order: 2,
        duration: 660,
      },
      {
        title: "Functions",
        description:
          "Understand functions, parameters, return values and reusable code.",
        order: 3,
        duration: 720,
      },
    ],
  },
];

const createVideoUrl = (moduleOrder, videoOrder) => {
  return `https://example.com/videos/full-stack/module-${moduleOrder}/video-${videoOrder}`;
};

const seedCourse = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(MONGO_URI);

    console.log("🍃 MongoDB connected for seed.");

    // Remove previous development seed.
    const existingCourse = await Course.findOne({
      slug: courseData.slug,
    });

    if (existingCourse) {
      await Video.deleteMany({
        course: existingCourse._id,
      });

      await Module.deleteMany({
        course: existingCourse._id,
      });

      await Course.deleteOne({
        _id: existingCourse._id,
      });

      console.log("🗑️ Previous seed course removed.");
    }

    // Create course.
    const course = await Course.create(courseData);

    console.log(`📚 Course created: ${course.title}`);

    let totalVideos = 0;

    // Create modules and videos.
    for (const moduleItem of moduleData) {
      const module = await Module.create({
        course: course._id,
        title: moduleItem.title,
        description: moduleItem.description,
        order: moduleItem.order,
        isPublished: true,
        totalVideos: moduleItem.videos.length,
      });

      console.log(
        `📦 Module created: ${module.title}`
      );

      const videos = moduleItem.videos.map((video) => ({
        course: course._id,
        module: module._id,
        title: video.title,
        description: video.description,
        videoUrl: createVideoUrl(
          moduleItem.order,
          video.order
        ),
        bunnyVideoId: "",
        thumbnailUrl:
          "https://placehold.co/1280x720/1e293b/ffffff?text=ApnaAcademy",
        duration: video.duration,
        order: video.order,

        // IMPORTANT:
        // First video of every module is preview.
        isPreview: video.order === 1,

        isPublished: true,
      }));

      await Video.insertMany(videos);

      totalVideos += videos.length;

      console.log(
        `   🎥 ${videos.length} videos created.`
      );
    }

    // Update course totals.
    course.totalModules = moduleData.length;
    course.totalVideos = totalVideos;

    await course.save();

    console.log("");
    console.log("======================================");
    console.log("🎉 COURSE SEED COMPLETED");
    console.log("======================================");
    console.log(`Course: ${course.title}`);
    console.log(`Slug: ${course.slug}`);
    console.log(`Modules: ${moduleData.length}`);
    console.log(`Videos: ${totalVideos}`);
    console.log("Preview videos: 3");
    console.log("Locked videos: 6");
    console.log("======================================");
  } catch (error) {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
};

seedCourse();