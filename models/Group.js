import mongoose from "mongoose"

const VoteSchema = new mongoose.Schema({
  option: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for backward compatibility
  },
  ip: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const GroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  options: [
    {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  ],
  votes: [VoteSchema],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
})

// Create indexes for better performance
GroupSchema.index({ createdAt: -1 })
GroupSchema.index({ "votes.ip": 1 })

export default mongoose.models.Group || mongoose.model("Group", GroupSchema)
