import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import api from "../api.js";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = typeof value === "number" ? value : 0;
    if (target === 0) { setDisplay(0); return; }
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

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div className="skeleton" style={{ height: 28, width: 120, margin: "0 auto 12px", borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 20, width: 200, margin: "0 auto", borderRadius: 6 }} />
      </div>
      <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
      </div>
      <div className="skeleton" style={{ height: 60, borderRadius: 16 }} />
      <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
    </div>
  );
}

export default function PublicStats() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/url/public/${code}`)
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.error || "Not found"));
  }, [code]);

  if (error)
    return (
      <div className="auth-page">
        <div className="auth-box" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔗</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Link Not Found
          </h2>
          <p style={{ color: "var(--text2)", marginBottom: 24, fontSize: 14 }}>{error}</p>
          <Link to="/login">
            <button className="btn-primary">Go Home →</button>
          </Link>
        </div>
      </div>
    );

  if (!data)
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "60px 16px" }}>
        <LoadingSkeleton />
      </div>
    );

  const isExpired = data.expiryDate && new Date() > new Date(data.expiryDate);

  return (
    <div className="dash-page" style={{ minHeight: "100vh", padding: "48px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--accent3), var(--accent2))",
            fontSize: 22,
            marginBottom: 14,
            boxShadow: "0 4px 20px var(--accent-glow)",
          }}>
            🔗
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 6,
            background: "linear-gradient(135deg, var(--text), var(--accent2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Public Link Stats
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Transparent analytics for this short link</p>
        </div>

        {/* Link Info */}
        <div className="card" style={{ marginBottom: 16, padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "var(--text2)", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              Short URL
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <a
                href={`${BASE_URL}/${data.shortCode}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontWeight: 600, color: "var(--accent)", fontSize: 16 }}
              >
                {BASE_URL}/{data.shortCode}
              </a>
              {isExpired && <span className="badge badge-red">⏰ expired</span>}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text2)", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              Destination
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", wordBreak: "break-all", lineHeight: 1.6 }}>{data.originalUrl}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: "center", padding: 22 }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 36,
              fontWeight: 700,
              color: "var(--accent)",
              marginBottom: 4,
            }}>
              <AnimatedNumber value={data.totalClicks} />
            </div>
            <div style={{ color: "var(--text2)", fontSize: 13, fontWeight: 500 }}>Total Clicks</div>
          </div>
          <div className="card" style={{ textAlign: "center", padding: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>
              {data.lastVisited ? new Date(data.lastVisited).toLocaleString() : "Never"}
            </div>
            <div style={{ color: "var(--text2)", fontSize: 13, fontWeight: 500 }}>Last Visited</div>
          </div>
        </div>

        {/* Dates */}
        <div className="card" style={{ marginBottom: 16, padding: 18 }}>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--text2)", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              📅 Created:{" "}
              <strong style={{ color: "var(--text)" }}>
                {new Date(data.createdAt).toLocaleDateString()}
              </strong>
            </span>
            {data.expiryDate && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                ⏰ Expires:{" "}
                <strong style={{ color: isExpired ? "var(--danger)" : "var(--warning)" }}>
                  {new Date(data.expiryDate).toLocaleDateString()}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="card chart-card">
          <h4>📈 Daily Clicks (Last 7 Days)</h4>
          {data.dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.dailyTrend}>
                <defs>
                  <linearGradient id="publicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--text2)", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fill: "var(--text2)", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-solid)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} fill="url(#publicGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "var(--text2)", fontSize: 13 }}>No clicks yet.</p>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 32, color: "var(--text3)", fontSize: 12 }}>
          Powered by{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
            URLShort
          </Link>
        </p>
      </div>
    </div>
  );
}
