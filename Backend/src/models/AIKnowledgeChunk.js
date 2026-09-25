import mongoose from "mongoose";

const aiKnowledgeChunkSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: null,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ["course", "module", "lesson-notes", "syllabus"],
      required: true,
      index: true,
    },
    sourceUrl: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    sourceTitle: {
      type: String,
      default: "",
      maxlength: 300,
    },
    page: {
      type: Number,
      default: null,
      min: 1,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      required: true,
      maxlength: 12000,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    embeddingModel: {
      type: String,
      required: true,
      maxlength: 200,
    },
    contentHash: {
      type: String,
      required: true,
      maxlength: 64,
    },
  },
  { timestamps: true }
);

aiKnowledgeChunkSchema.index({ course: 1, sourceType: 1, chunkIndex: 1 });
aiKnowledgeChunkSchema.index({ course: 1, contentHash: 1 });

const AIKnowledgeChunk = mongoose.model("AIKnowledgeChunk", aiKnowledgeChunkSchema);

export default AIKnowledgeChunk;
