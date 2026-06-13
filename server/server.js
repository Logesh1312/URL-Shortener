import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.js";
import urlRoutes from "./routes/url.js";
import statsRoutes from "./routes/stats.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);
app.use("/api/stats", statsRoutes);

// Root route: redirect to frontend (useful when visiting server root)
app.get("/", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:3000";
  return res.redirect(frontendUrl);
});

// Redirect short URL (must be after API routes)
import Url from "./models/Url.js";

// Helper to parse User Agent
function parseUserAgent(uaString) {
  let browser = "Other";
  let os = "Other";
  let device = "Desktop";

  if (!uaString) return { browser, os, device };

  if (uaString.includes("Firefox")) browser = "Firefox";
  else if (uaString.includes("SamsungBrowser")) browser = "Samsung Browser";
  else if (uaString.includes("Opera") || uaString.includes("OPR")) browser = "Opera";
  else if (uaString.includes("Edge") || uaString.includes("Edg")) browser = "Edge";
  else if (uaString.includes("Chrome")) browser = "Chrome";
  else if (uaString.includes("Safari")) browser = "Safari";

  if (uaString.includes("Windows")) os = "Windows";
  else if (uaString.includes("Macintosh") || uaString.includes("Mac OS")) os = "macOS";
  else if (uaString.includes("Linux")) os = "Linux";
  else if (uaString.includes("Android")) os = "Android";
  else if (uaString.includes("iPhone") || uaString.includes("iPad")) os = "iOS";

  if (/Mobi|Android|iPhone|iPad|Tablet/i.test(uaString)) {
    device = "Mobile";
  }

  return { browser, os, device };
}

// Helper to parse Referrer
function getReferrerDomain(ref) {
  if (!ref) return "Direct";
  try {
    const url = new URL(ref);
    return url.hostname || "Direct";
  } catch {
    return "Direct";
  }
}

// Helper to get random country for localhost testing
function getRandomCountry() {
  const countries = ["United States", "India", "United Kingdom", "Germany", "Canada", "Australia", "France", "Japan"];
  return countries[Math.floor(Math.random() * countries.length)];
}

app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (!url) return res.status(404).json({ error: "URL not found" });

    // Check expiry
    if (url.expiryDate && new Date() > url.expiryDate) {
      return res.status(410).json({ error: "This link has expired" });
    }

    // Check password protection
    if (url.password) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/protect/${url.shortCode}`);
    }

    // Parse visitor analytics
    const ua = parseUserAgent(req.headers["user-agent"]);
    const referrer = getReferrerDomain(req.headers["referer"] || req.headers["referrer"]);
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const country = getRandomCountry();
    const isUnique = !url.visitHistory.some(v => v.ip === ip);

    url.clicks++;
    url.lastVisited = new Date();
    url.visitHistory.push({
      timestamp: new Date(),
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
      referrer,
      ip,
      country,
      isUnique,
    });
    await url.save();

    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || "0.0.0.0";
    app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
