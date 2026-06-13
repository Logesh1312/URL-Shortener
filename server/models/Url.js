import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  device: { type: String, default: "Desktop" },
  browser: { type: String, default: "Other" },
  os: { type: String, default: "Other" },
  country: { type: String, default: "Unknown" },
  referrer: { type: String, default: "Direct" },
  ip: { type: String, default: null },
  isUnique: { type: Boolean, default: true },
});

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customAlias: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  clicks: { type: Number, default: 0 },
  visitHistory: [visitSchema],
  lastVisited: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },
  password: { type: String, default: null },
  isFavorite: { type: Boolean, default: false },
});

export default mongoose.model("Url", urlSchema);
