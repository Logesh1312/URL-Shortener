import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = typeof value === "number" ? value : 0;
    if (target === 0) {
      setDisplay(0);
      return;
    }
    const duration = 800;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplay(target);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

function StatCard({ label, value, icon, colorClass, gradient }) {
  return (
    <div className="card stat-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: gradient,
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />
      <div className={`stat-icon ${colorClass}`} style={{ color: "#fff", background: gradient }}>
        {icon}
      </div>
      <div className="stat-value">
        <AnimatedNumber value={value} />
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function DashboardOverview({ stats, loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ padding: 24, textAlign: "center" }}>
              <div className="skeleton" style={{ height: 48, width: 48, borderRadius: 14, margin: "0 auto 12px" }} />
              <div className="skeleton" style={{ height: 32, width: "50%", margin: "0 auto 8px" }} />
              <div className="skeleton" style={{ height: 14, width: "60%", margin: "0 auto" }} />
            </div>
          ))}
        </div>
        <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, animation: "fadeIn 0.5s ease" }}>
      {/* Stat Cards Grid */}
      <div className="stat-grid">
        <StatCard
          label="Total Links"
          value={stats.totalUrls}
          icon="🔗"
          colorClass=""
          gradient="linear-gradient(135deg, #6366F1, #8B5CF6)"
        />
        <StatCard
          label="Total Clicks"
          value={stats.totalClicks}
          icon="👆"
          colorClass=""
          gradient="linear-gradient(135deg, #10B981, #059669)"
        />
        <StatCard
          label="Active Links"
          value={stats.activeLinks}
          icon="⚡"
          colorClass=""
          gradient="linear-gradient(135deg, #06B6D4, #0891B2)"
        />
        <StatCard
          label="QR Codes Generated"
          value={stats.qrCodesGenerated}
          icon="📱"
          colorClass=""
          gradient="linear-gradient(135deg, #F59E0B, #D97706)"
        />
      </div>

      {/* Main Area Chart */}
      <div className="card chart-card">
        <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
          📈 Daily Clicks (Last 30 Days)
        </h4>
        <div style={{ width: "100%", height: 240, marginTop: 12 }}>
          {stats.dailyTrend && stats.dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--text2)", fontSize: 11 }}
                  tickFormatter={(d) => d.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text2)", fontSize: 11 }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-solid)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    boxShadow: "var(--shadow)",
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dashboardGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text2)" }}>
              No click data yet. Shorten a link and visit it to generate click logs.
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Links */}
      {stats.topLinks && stats.topLinks.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", marginBottom: 16, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            🏆 Top Performing Links
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.topLinks.map((link, i) => (
              <div key={link._id || i} className="top-link-row" style={{ padding: "12px 6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: i === 0 ? "rgba(245, 158, 11, 0.15)" : "var(--surface2)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: i === 0 ? "#F59E0B" : "var(--text2)"
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <a
                      href={`${import.meta.env.VITE_BASE_URL || "http://localhost:5000"}/${link.shortCode}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13.5 }}
                    >
                      /{link.shortCode}
                    </a>
                    <span style={{ fontSize: 11, color: "var(--text3)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {link.originalUrl}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {link.isFavorite && <span style={{ color: "#FBBF24" }}>★</span>}
                  <span className="badge badge-purple" style={{ fontSize: 11 }}>
                    {link.clicks} clicks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
