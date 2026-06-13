import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Landing() {
  const { isLoggedIn, username } = useAuth();
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState("");
  const [demoResult, setDemoResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDemoShorten = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    // Create a mock demo short code
    const randomCode = Math.random().toString(36).substring(2, 8);
    const mockShortUrl = `http://localhost:5000/${randomCode}`;
    setDemoResult(mockShortUrl);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(demoResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="dash-header-logo">
          <span>🔗</span> URLShort
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {isLoggedIn ? (
            <>
              <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>
                Logged in as <strong>{username}</strong>
              </span>
              <Link to="/dashboard">
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
                  Go to Dashboard →
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: "var(--text)", fontSize: 14, fontWeight: 500, marginRight: 8 }}>
                Sign In
              </Link>
              <Link to="/signup">
                <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
                  Sign Up Free
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-badge">
          <span>✨</span> Redesigned with Premium SaaS Analytics
        </div>
        <h1>Shorten, Secure & Track <br />Your Links In Real-time</h1>
        <p>
          Create custom short URLs, generate styled QR codes, protect links with passwords, and track detailed demographics of your visitors.
        </p>

        {/* URL Shortener Form */}
        <div className="landing-cta-box card">
          <form onSubmit={handleDemoShorten} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="url"
              placeholder="Paste your long link here (e.g. https://example.com/very-long)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
              style={{ flex: 1, minWidth: 260 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: "12px 24px" }}>
              Shorten URL
            </button>
          </form>

          {demoResult && (
            <div style={{ marginTop: 20, textAlign: "left", animation: "slideUp 0.4s ease" }}>
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", padding: "12px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <a href={urlInput} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14.5 }}>
                  {demoResult}
                </a>
                <button className={copied ? "btn-success" : "btn-ghost"} onClick={handleCopy} style={{ padding: "6px 12px", fontSize: 12 }}>
                  {copied ? "✅ Copied" : "📋 Copy Link"}
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--text2)", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                💡 <strong>Demo Link:</strong> Star this URL, customize QR colors, and view advanced analytics by registering!
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Statistics Section */}
      <section style={{ background: "rgba(30, 41, 59, 0.4)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "60px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, textAlign: "center" }}>
          <div>
            <h3 style={{ fontSize: 44, fontWeight: 900, color: "var(--accent)" }}>10M+</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>Links Shortened</p>
          </div>
          <div>
            <h3 style={{ fontSize: 44, fontWeight: 900, color: "var(--accent2)" }}>150M+</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>Total Clicks Redirected</p>
          </div>
          <div>
            <h3 style={{ fontSize: 44, fontWeight: 900, color: "var(--accent-cyan)" }}>99.9%</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>Redirection Uptime</p>
          </div>
          <div>
            <h3 style={{ fontSize: 44, fontWeight: 900, color: "var(--accent-emerald)" }}>24/7</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>Visitor Tracking</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h2 className="section-title">Designed for modern publishers</h2>
        <p className="section-subtitle">Everything you need to optimize and protect your link sharing flow in one dashboard.</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card-icon">🚀</div>
            <h3 className="feature-card-title">Custom Short Aliases</h3>
            <p className="feature-card-desc">Brand your links with recognizable text slugs rather than random strings to build customer trust and clicks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">📈</div>
            <h3 className="feature-card-title">Real-time Analytics</h3>
            <p className="feature-card-desc">Track clicks by country, operating system, web browser, device type, referrer source, and hour-by-hour spikes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">🔒</div>
            <h3 className="feature-card-title">Password Protection</h3>
            <p className="feature-card-desc">Secure confidential links from public visits. Logins verify credentials before permitting access to original URLs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">🎨</div>
            <h3 className="feature-card-title">Custom QR Codes</h3>
            <p className="feature-card-desc">Automatically generate QR codes with custom styling, colors, clipboard copy options, and instant PNG downloads.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ maxWidth: 1000, margin: "80px auto 100px", padding: "0 24px" }}>
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">Get shortened links ready to publish in three easy steps.</p>
        
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-step">1</div>
            <div className="timeline-content">
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Paste Destination URL</h4>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>Input your target long web address. Add expiry parameters or password keys if required.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-step">2</div>
            <div className="timeline-content">
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Customize Slugs & QR codes</h4>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>Create a short alias for branding. Style the QR code foreground and background colors.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-step">3</div>
            <div className="timeline-content">
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Share & Measure Impact</h4>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>Publish the links on social media or copy details. Access advanced charts to audit visitor metrics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", background: "rgba(15, 23, 42, 0.6)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ color: "var(--text2)", fontSize: 13 }}>
            © 2026 <strong>URLShort SaaS Platform</strong>. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 18 }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" title="Github">🐱</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter">🐦</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn">💼</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
