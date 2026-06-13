import React, { useState, useEffect, useCallback } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import DashboardOverview from "../components/DashboardOverview.jsx";
import AnalyticsPage from "../components/AnalyticsPage.jsx";
import UrlTable from "../components/UrlTable.jsx";
import QrModal from "../components/QrModal.jsx";

// ═══════════════════════════════════════════════════════════════════════════
// Toast Notification Component & Hook
// ═══════════════════════════════════════════════════════════════════════════
let toastIdCounter = 0;
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}${t.exiting ? " toast-exit" : ""}`}>
          <span style={{ fontSize: 16 }}>
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Confirm Delete Dialog Component
// ═══════════════════════════════════════════════════════════════════════════
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Are you sure?
        </h3>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Link Creation Modal (ShortenModal)
// ═══════════════════════════════════════════════════════════════════════════
function ShortenModal({ onClose, onCreated, addToast }) {
  const [form, setForm] = useState({ originalUrl: "", customAlias: "", expiryDate: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias.trim()) payload.customAlias = form.customAlias.trim();
      if (form.expiryDate) payload.expiryDate = form.expiryDate;
      if (form.password.trim()) payload.password = form.password;
      
      await api.post("/url/shorten", payload);
      addToast("URL shortened successfully!", "success");
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">✂️ Shorten a URL</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="form-label">Destination URL *</label>
            <input
              id="shorten-url"
              type="url"
              placeholder="https://example.com/very-long-url"
              value={form.originalUrl}
              onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="form-label">Custom Slug Alias (optional)</label>
            <input
              id="shorten-alias"
              type="text"
              placeholder="e.g. launch-promo"
              value={form.customAlias}
              onChange={(e) => setForm({ ...form, customAlias: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Expiry Date (optional)</label>
              <input
                id="shorten-expiry"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="form-label">Password Link Protect (optional)</label>
              <input
                id="shorten-pass"
                type="text"
                placeholder="Enter password..."
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button id="shorten-submit" type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Shortening…" : "Shorten URL →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Edit Link Modal (EditModal)
// ═══════════════════════════════════════════════════════════════════════════
function EditModal({ url, onClose, onSaved, addToast }) {
  const [form, setForm] = useState({
    originalUrl: url.originalUrl,
    expiryDate: url.expiryDate ? url.expiryDate.split("T")[0] : "",
    password: url.password || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.put(`/url/${url._id}`, {
        originalUrl: form.originalUrl,
        expiryDate: form.expiryDate || null,
        password: form.password || null,
      });
      addToast("URL updated successfully!", "success");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">✏️ Edit URL slug: /{url.shortCode}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="form-label">Destination URL</label>
            <input
              id="edit-url"
              type="url"
              value={form.originalUrl}
              onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              required
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Expiry Date</label>
              <input
                id="edit-expiry"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="form-label">Access Password</label>
              <input
                id="edit-pass"
                type="text"
                placeholder="None"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button id="edit-submit" type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Single Link Analytics Overlay Modal
// ═══════════════════════════════════════════════════════════════════════════
function LinkAnalyticsModal({ url, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/url/${url._id}/analytics`)
      .then((r) => {
        setData(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [url._id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">📊 Stats Overview — /{url.shortCode}</h3>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 60, borderRadius: 10 }} />
            <div className="skeleton" style={{ height: 160, borderRadius: 10 }} />
          </div>
        ) : data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="card" style={{ padding: 14, textAlign: "center" }}>
                <div style={{ color: "var(--text2)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Total Clicks</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>{data.totalClicks}</div>
              </div>
              <div className="card" style={{ padding: 14, textAlign: "center" }}>
                <div style={{ color: "var(--text2)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Last Visited</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginTop: 8 }}>
                  {data.lastVisited ? new Date(data.lastVisited).toLocaleDateString() : "Never"}
                </div>
              </div>
            </div>
            
            <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text2)" }}>Recent Visit Logs</h4>
            <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {data.recentVisits && data.recentVisits.length > 0 ? (
                data.recentVisits.map((v, i) => (
                  <div key={i} className="card" style={{ padding: "10px 14px", fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                    <span>{new Date(v.timestamp).toLocaleString()}</span>
                    <span style={{ color: "var(--text2)" }}>
                      {v.device || "Desktop"} • {v.browser || "Chrome"}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--text3)", fontSize: 12 }}>No visits logged yet.</div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <a
                href={`/stats/${url.shortCode}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}
              >
                🌐 Public Analytics Page →
              </a>
              <button className="btn-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--danger)" }}>Failed to load analytics.</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Dashboard Page
// ═══════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("links"); // links, overview, analytics, bulk, settings
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toasts, addToast } = useToast();

  // Settings tab password inputs
  const [settingsForm, setSettingsForm] = useState({ oldPassword: "", newPassword: "" });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Bulk CSV file input
  const [csvFile, setCsvFile] = useState(null);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadData = async () => {
    try {
      const [urlRes, statsRes] = await Promise.all([
        api.get("/url"),
        api.get("/stats")
      ]);
      setUrls(urlRes.data);
      setStats(statsRes.data);
    } catch {
      addToast("Failed to load data from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (url) => {
    setConfirmDelete(url);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/url/${confirmDelete._id}`);
      addToast("URL deleted successfully!", "success");
      loadData();
    } catch {
      addToast("Failed to delete URL", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleToggleFavorite = async (url) => {
    try {
      await api.put(`/url/${url._id}`, { isFavorite: !url.isFavorite });
      addToast(url.isFavorite ? "Removed link from favorites" : "Starred link as favorite!", "success");
      loadData();
    } catch {
      addToast("Failed to update favorite status", "error");
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!settingsForm.oldPassword || !settingsForm.newPassword) {
      addToast("Please fill in current and new password fields", "error");
      return;
    }
    setSettingsLoading(true);
    try {
      await api.put("/auth/change-password", settingsForm);
      addToast("Password updated successfully!", "success");
      setSettingsForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to change password", "error");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setBulkLoading(true);
    setBulkResults(null);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await api.post("/url/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setBulkResults(res.data.results);
      addToast(`CSV Processed: ${res.data.results.filter(r => r.shortUrl).length} links generated!`, "success");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.error || "Bulk upload failed", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "url\nhttps://google.com\nhttps://github.com\nhttps://youtube.com\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_links.csv";
    link.click();
  };

  return (
    <div className="dash-container">
      <ToastContainer toasts={toasts} />

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main content pane */}
      <main className="dash-content-pane">
        {/* Top Navbar */}
        <Navbar onSelectTab={setActiveTab} />

        {/* Tab Subpanels */}
        
        {/* VIEW 1: Links management table */}
        {activeTab === "links" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
                  🔗 My Shortened Links
                </h2>
                <p style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 4 }}>
                  Manage, stars, customize QR, lock access, and view click statistics.
                </p>
              </div>
              <button
                id="btn-new"
                className="btn-primary"
                onClick={() => setModal("shorten")}
                style={{ padding: "10px 20px" }}
              >
                + Create Short URL
              </button>
            </div>

            <UrlTable
              urls={urls}
              loading={loading}
              onDelete={handleDelete}
              onEdit={(u) => { setSelected(u); setModal("edit"); }}
              onQR={(u) => { setSelected(u); setModal("qr"); }}
              onAnalytics={(u) => { setSelected(u); setModal("analytics"); }}
              onCopy={() => addToast("Short link copied to clipboard!", "success")}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* VIEW 2: Overview Analytics charts */}
        {activeTab === "overview" && (
          <DashboardOverview stats={stats} loading={loading} />
        )}

        {/* VIEW 3: Dedicated Analytics stats charts */}
        {activeTab === "analytics" && (
          <AnalyticsPage stats={stats} loading={loading} />
        )}

        {/* VIEW 4: Bulk URL Shortener CSV Upload */}
        {activeTab === "bulk" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.5s ease" }}>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
                📂 Bulk URL Shortener
              </h2>
              <p style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 4 }}>
                Shorten multiple destination websites at once using CSV templates.
              </p>
            </div>

            <div className="card" style={{ maxWidth: 600, padding: 32 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
                Upload CSV File
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 18 }}>
                Ensure your file utilizes a column labeled <code style={{ background: "var(--surface2)", padding: "2px 6px", borderRadius: 4 }}>url</code>.
                Each row will be shortened and assigned a unique alias automatically.
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <button className="btn-ghost" onClick={downloadSampleCSV} style={{ padding: "8px 16px", fontSize: 12.5 }}>
                  ⬇️ Download Sample CSV
                </button>
              </div>

              <form onSubmit={handleBulkSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <input
                  id="bulk-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  required
                  style={{ borderStyle: "dashed", padding: "24px", textAlign: "center", cursor: "pointer" }}
                />
                <button
                  id="bulk-submit"
                  type="submit"
                  className="btn-primary"
                  style={{ alignSelf: "flex-end" }}
                  disabled={bulkLoading || !csvFile}
                >
                  {bulkLoading ? "Shortening URLs..." : "Upload & Shorten →"}
                </button>
              </form>
            </div>

            {bulkResults && (
              <div className="card" style={{ padding: 24 }}>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                  CSV Processing Results ({bulkResults.length})
                </h4>
                <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {bulkResults.map((r, i) => (
                    <div key={i} className="card" style={{ padding: "12px 16px", fontSize: 13, background: "var(--surface2)" }}>
                      <div style={{ color: "var(--text2)", fontSize: 11, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.originalUrl}
                      </div>
                      {r.shortUrl ? (
                        <span style={{ color: "var(--success)", fontWeight: 600 }}>✅ Generated link: {r.shortUrl}</span>
                      ) : (
                        <span style={{ color: "var(--danger)", fontWeight: 600 }}>❌ Error: {r.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: User settings profile / change password */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.5s ease" }}>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
                ⚙️ User Settings
              </h2>
              <p style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 4 }}>
                Modify password attributes and manage SaaS configurations.
              </p>
            </div>

            <div className="card" style={{ maxWidth: 500, padding: 32 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
                🔑 Change Account Password
              </h3>
              
              <form onSubmit={handleSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password..."
                    value={settingsForm.oldPassword}
                    onChange={(e) => setSettingsForm({ ...settingsForm, oldPassword: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min. 6 chars)..."
                    value={settingsForm.newPassword}
                    onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ alignSelf: "flex-end", marginTop: 8 }}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      {modal === "shorten" && (
        <ShortenModal
          onClose={() => setModal(null)}
          onCreated={loadData}
          addToast={addToast}
        />
      )}

      {modal === "edit" && selected && (
        <EditModal
          url={selected}
          onClose={() => setModal(null)}
          onSaved={loadData}
          addToast={addToast}
        />
      )}

      {modal === "qr" && selected && (
        <QrModal
          url={selected}
          onClose={() => setModal(null)}
          addToast={addToast}
        />
      )}

      {modal === "analytics" && selected && (
        <LinkAnalyticsModal
          url={selected}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Are you sure you want to permanently delete the short link "/${confirmDelete.shortCode}"?`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
