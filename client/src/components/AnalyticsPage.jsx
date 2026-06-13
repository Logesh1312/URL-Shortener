import React, { useState } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"];

export default function AnalyticsPage({ stats, loading }) {
  const [timeframe, setTimeframe] = useState("30"); // "7", "30", "all"
  
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
        </div>
        <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>
        No analytics data available. Verify your database connection or generate link visits.
      </div>
    );
  }

  // Handle Export Analytics to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Section 1: Summary
    csvContent += "METRIC,VALUE\n";
    csvContent += `Total URLs Created,${stats.totalUrls}\n`;
    csvContent += `Total Clicks,${stats.totalClicks}\n`;
    csvContent += `Active Links,${stats.activeLinks}\n`;
    csvContent += `Unique Visitors,${stats.uniqueVisitors}\n\n`;

    // Section 2: Countries
    csvContent += "COUNTRY,CLICKS\n";
    stats.countries?.forEach((c) => {
      csvContent += `"${c.name}",${c.value}\n`;
    });
    csvContent += "\n";

    // Section 3: Referrers
    csvContent += "REFERRER,CLICKS\n";
    stats.referrers?.forEach((r) => {
      csvContent += `"${r.name}",${r.value}\n`;
    });
    csvContent += "\n";

    // Section 4: Devices
    csvContent += "DEVICE,CLICKS\n";
    stats.devices?.forEach((d) => {
      csvContent += `"${d.name}",${d.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "url_shortener_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter daily clicks based on timeframe
  const filteredDailyTrend = (() => {
    if (!stats.dailyTrend) return [];
    if (timeframe === "7") return stats.dailyTrend.slice(-7);
    if (timeframe === "30") return stats.dailyTrend.slice(-30);
    return stats.dailyTrend;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, animation: "fadeIn 0.5s ease" }}>
      {/* Header Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
            📈 Advanced Analytics
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 4 }}>
            Deep dive statistics and audience demographics for all your links.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button className="btn-primary" onClick={handleExportCSV} style={{ padding: "8px 16px", fontSize: 13 }}>
            ⬇️ Export Stats CSV
          </button>
        </div>
      </div>

      {/* Traffic Over Time */}
      <div className="card" style={{ padding: 24 }}>
        <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
          📊 Traffic Trend Over Time
        </h4>
        <div style={{ width: "100%", height: 260 }}>
          {filteredDailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredDailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--text2)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--text2)", fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
                <Area type="monotone" dataKey="count" name="Clicks" stroke="var(--accent)" strokeWidth={2.5} fill="url(#analyticsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 13 }}>
              No clicks registered during this period.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Countries & Referrers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {/* Country Demographics */}
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
            🌍 Top Country Visitors
          </h4>
          <div style={{ width: "100%", height: 220 }}>
            {stats.countries && stats.countries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.countries.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis type="number" tick={{ fill: "var(--text2)", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "var(--text)", fontSize: 12, fontWeight: 500 }} width={80} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
                  <Bar dataKey="value" name="Clicks" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 13 }}>
                No country data logged.
              </div>
            )}
          </div>
        </div>

        {/* Referrer Channels */}
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
            📣 Referrer Channels
          </h4>
          <div style={{ width: "100%", height: 220 }}>
            {stats.referrers && stats.referrers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.referrers}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.referrers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11, color: "var(--text2)" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 13 }}>
                No referrer traffic found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Devices, Browsers, OS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {/* Device Types */}
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
            📱 Device Distribution
          </h4>
          <div style={{ width: "100%", height: 200 }}>
            {stats.devices && stats.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.devices}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 13 }}>
                No device clicks logged.
              </div>
            )}
          </div>
        </div>

        {/* Top Browsers */}
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
            🌐 Top Browsers
          </h4>
          <div style={{ width: "100%", height: 200 }}>
            {stats.browsers && stats.browsers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.browsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "var(--text2)", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "var(--text2)", fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="value" name="Clicks" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 13 }}>
                No browser clicks logged.
              </div>
            )}
          </div>
        </div>

        {/* Operating Systems */}
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
            💻 Operating Systems
          </h4>
          <div style={{ width: "100%", height: 200 }}>
            {stats.osList && stats.osList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.osList}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.osList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 13 }}>
                No OS clicks logged.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hourly / Peak Traffic */}
      <div className="card" style={{ padding: 24 }}>
        <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
          ⚡ Hourly Peak Traffic Distribution
        </h4>
        <div style={{ width: "100%", height: 200 }}>
          {stats.peakTraffic && stats.peakTraffic.some(h => h.clicks > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.peakTraffic} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="hour" tick={{ fill: "var(--text2)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--text2)", fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="clicks" name="Clicks" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 13 }}>
              No hourly visits recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
