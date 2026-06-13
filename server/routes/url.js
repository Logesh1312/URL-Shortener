import express from "express";
import { nanoid } from "nanoid";
import multer from "multer";
import { parse } from "csv-parse/sync";
import Url from "../models/Url.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helpers for parsing analytics in password verify route
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

function getReferrerDomain(ref) {
  if (!ref) return "Direct";
  try {
    const url = new URL(ref);
    return url.hostname || "Direct";
  } catch {
    return "Direct";
  }
}

function getRandomCountry() {
  const countries = ["United States", "India", "United Kingdom", "Germany", "Canada", "Australia", "France", "Japan"];
  return countries[Math.floor(Math.random() * countries.length)];
}

// ─── Helper: validate URL ───────────────────────────────────────────────────
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ─── Get all URLs for user ───────────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Create short URL ────────────────────────────────────────────────────────
router.post("/shorten", authMiddleware, async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryDate, password, isFavorite } = req.body;

    if (!originalUrl) return res.status(400).json({ error: "URL is required" });
    if (!isValidUrl(originalUrl)) return res.status(400).json({ error: "Invalid URL format" });

    let shortCode = customAlias ? customAlias.trim() : nanoid(6);

    if (customAlias) {
      const exists = await Url.findOne({ shortCode: customAlias.trim() });
      if (exists) return res.status(400).json({ error: "Custom alias already taken" });
    }

    const url = new Url({
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      userId: req.userId,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      password: password || null,
      isFavorite: !!isFavorite,
    });

    await url.save();
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    res.json({ shortUrl, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete URL ──────────────────────────────────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ error: "URL not found" });
    await Url.findByIdAndDelete(req.params.id);
    res.json({ message: "URL deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Edit destination URL (Bonus) ────────────────────────────────────────────
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { originalUrl, expiryDate, password, isFavorite } = req.body;
    if (originalUrl && !isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ error: "URL not found" });

    if (originalUrl) url.originalUrl = originalUrl;
    if (expiryDate !== undefined) url.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (password !== undefined) url.password = password || null;
    if (isFavorite !== undefined) url.isFavorite = !!isFavorite;
    await url.save();
    res.json(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get analytics for a URL (Bonus) ─────────────────────────────────────────
router.get("/:id/analytics", authMiddleware, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ error: "URL not found" });

    // Build daily click trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap = {};
    url.visitHistory
      .filter((v) => new Date(v.timestamp) >= thirtyDaysAgo)
      .forEach((v) => {
        const date = new Date(v.timestamp).toISOString().split("T")[0];
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });

    const dailyTrend = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const lastVisited =
      url.visitHistory.length > 0
        ? url.visitHistory[url.visitHistory.length - 1].timestamp
        : null;

    res.json({
      totalClicks: url.clicks,
      lastVisited,
      dailyTrend,
      recentVisits: url.visitHistory.slice(-10).reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Public stats page (Bonus) ───────────────────────────────────────────────
router.get("/public/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (!url) return res.status(404).json({ error: "URL not found" });

    const lastVisited =
      url.visitHistory.length > 0
        ? url.visitHistory[url.visitHistory.length - 1].timestamp
        : null;

    // Daily trend last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyMap = {};
    url.visitHistory
      .filter((v) => new Date(v.timestamp) >= sevenDaysAgo)
      .forEach((v) => {
        const date = new Date(v.timestamp).toISOString().split("T")[0];
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });
    const dailyTrend = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      totalClicks: url.clicks,
      createdAt: url.createdAt,
      lastVisited,
      expiryDate: url.expiryDate,
      dailyTrend,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Bulk URL shortening via CSV (Bonus) ─────────────────────────────────────
router.post("/bulk", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "CSV file is required" });

    const csvContent = req.file.buffer.toString("utf-8");
    const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });

    const results = [];
    for (const record of records) {
      const originalUrl = record.url || record.URL || record.originalUrl;
      if (!originalUrl || !isValidUrl(originalUrl)) {
        results.push({ originalUrl, error: "Invalid or missing URL" });
        continue;
      }
      try {
        const shortCode = nanoid(6);
        const url = new Url({ originalUrl, shortCode, userId: req.userId });
        await url.save();
        results.push({
          originalUrl,
          shortUrl: `${process.env.BASE_URL}/${shortCode}`,
          shortCode,
        });
      } catch (e) {
        results.push({ originalUrl, error: e.message });
      }
    }
    res.json({ results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Verify password for protected short URL ───────────────────────────────
router.post("/verify-password/:code", async (req, res) => {
  try {
    const { password } = req.body;
    const url = await Url.findOne({ shortCode: req.params.code });
    if (!url) return res.status(404).json({ error: "URL not found" });

    // Check expiry
    if (url.expiryDate && new Date() > url.expiryDate) {
      return res.status(410).json({ error: "This link has expired" });
    }

    if (url.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Log visitor analytics on successful password bypass
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

    res.json({ originalUrl: url.originalUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
