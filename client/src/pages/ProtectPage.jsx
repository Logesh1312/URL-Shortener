import React, { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api.js";

export default function ProtectPage() {
  const { code } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post(`/url/verify-password/${code}`, { password });
      // Redirect to original URL upon success
      window.location.href = res.data.originalUrl;
    } catch (err) {
      setError(err.response?.data?.error || "Incorrect password or link expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box protect-card">
        <div className="lock-icon">🔒</div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>
          Password Protected
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 13.5, marginBottom: 24, lineHeight: 1.5 }}>
          This link is password-protected. Please enter the password to proceed to the destination.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              placeholder="Enter link password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ textAlign: "center", fontSize: 15 }}
            />
          </div>
          {error && <div className="error" style={{ fontSize: 13, color: "var(--danger)" }}>⚠️ {error}</div>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: 12, fontWeight: 600 }}>
            {loading ? "Verifying..." : "Unlock & Redirect →"}
          </button>
        </form>
      </div>
    </div>
  );
}
