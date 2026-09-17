import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    shortDescription: {
      type: String,
      default: "",
      maxlength: 500,
    },

    description: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    previewSyllabusPdfUrl: {
      type: String,
      default: "",
      trim: true,
    },

    freeResourcesUrl: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all-levels"],
      default: "beginner",
    },

    language: {
      type: String,
      default: "English",
    },

    instructor: {
      name: {
        type: String,
        default: "",
      },

      avatar: {
        type: String,
        default: "",
      },
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    allAccessPrice: {
      type: Number,
      default: 99,
      min: 0,
    },

    durationDays: {
      type: Number,
      default: 30,
      min: 1,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
      default: [],
    },

    totalModules: {
      type: Number,
      default: 0,
    },

    totalVideos: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Admin course list sorts by newest course first.
 * Public catalog filters published courses and sorts featured/newest.
 * These indexes keep both hot read paths on indexed plans.
 */
courseSchema.index({ createdAt: -1 });
courseSchema.index({ isPublished: 1, isFeatured: -1, createdAt: -1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;
