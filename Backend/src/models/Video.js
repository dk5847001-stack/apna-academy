import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
    },

    /*
     * Video provider/source used by the learning player.
     *
     * Existing documents default to Bunny so the source migration is
     * backward-compatible. Phase 2 will expose this field in Admin and
     * Phase 3 will switch the player based on this value.
     */
    videoSource: {
      type: String,
      enum: ["bunny", "drive"],
      default: "bunny",
      index: true,
    },

    videoUrl: {
      type: String,
      default: "",
    },

    bunnyVideoId: {
      type: String,
      default: "",
      index: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    notesPdfUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    isPreview: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Course detail/catalog reads fetch videos by course + module and then
 * return them in module/order sequence. Keep this hot query covered by a
 * single compound index instead of making MongoDB combine separate indexes.
 */
videoSchema.index({ course: 1, module: 1, order: 1 });
videoSchema.index({ module: 1, order: 1 });

const Video = mongoose.model("Video", videoSchema);

export default Video;
