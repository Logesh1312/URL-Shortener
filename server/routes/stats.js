import express from "express";
import Url from "../models/Url.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Overall dashboard stats for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.userId });
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);

    const now = new Date();
    const activeLinks = urls.filter(u => !u.expiryDate || new Date(u.expiryDate) > now).length;
    const qrCodesGenerated = totalUrls;

    // Top 5 performing links
    const topLinks = [...urls]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((u) => ({
        _id: u._id,
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        clicks: u.clicks,
        isFavorite: u.isFavorite,
        createdAt: u.createdAt,
      }));

    // Timeframe filters / date calculations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap = {};
    const deviceMap = {};
    const browserMap = {};
    const osMap = {};
    const countryMap = {};
    const referrerMap = {};
    const hourlyClicks = Array(24).fill(0);
    let uniqueVisitors = 0;

    urls.forEach((url) => {
      url.visitHistory.forEach((v) => {
        const visitDate = new Date(v.timestamp);
        
        // Clicks over time (last 30 days)
        if (visitDate >= thirtyDaysAgo) {
          const dateStr = visitDate.toISOString().split("T")[0];
          dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
        }

        // Unique visitors count
        if (v.isUnique) {
          uniqueVisitors++;
        }

        // Device distribution
        const device = v.device || "Desktop";
        deviceMap[device] = (deviceMap[device] || 0) + 1;

        // Browser distribution
        const browser = v.browser || "Other";
        browserMap[browser] = (browserMap[browser] || 0) + 1;

        // OS distribution
        const os = v.os || "Other";
        osMap[os] = (osMap[os] || 0) + 1;

        // Country distribution
        const country = v.country || "Unknown";
        countryMap[country] = (countryMap[country] || 0) + 1;

        // Referrer distribution
        const referrer = v.referrer || "Direct";
        referrerMap[referrer] = (referrerMap[referrer] || 0) + 1;

        // Hourly distribution for peak traffic
        const hour = visitDate.getHours();
        hourlyClicks[hour]++;
      });
    });

    const dailyTrend = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const devices = Object.entries(deviceMap).map(([name, value]) => ({ name, value }));
    const browsers = Object.entries(browserMap).map(([name, value]) => ({ name, value }));
    const osList = Object.entries(osMap).map(([name, value]) => ({ name, value }));
    const countries = Object.entries(countryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const referrers = Object.entries(referrerMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const peakTraffic = hourlyClicks.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      clicks: count,
    }));

    res.json({
      totalUrls,
      totalClicks,
      activeLinks,
      qrCodesGenerated,
      uniqueVisitors,
      topLinks,
      dailyTrend,
      devices,
      browsers,
      osList,
      countries,
      referrers,
      peakTraffic,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
