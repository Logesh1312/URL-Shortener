import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar({ activeTab, onSelectTab }) {
  const { logout } = useAuth();

  const links = [
    { id: "links", label: "My Links", icon: "🔗" },
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analytics", label: "Analytics Stats", icon: "📈" },
    { id: "bulk", label: "Bulk Shorten", icon: "📂" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>🔗</span> URLShort
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <button
            key={link.id}
            className={`sidebar-link${activeTab === link.id ? " active" : ""}`}
            onClick={() => onSelectTab(link.id)}
          >
            <span style={{ fontSize: 16 }}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-link danger-item"
          onClick={logout}
          style={{ gap: 12, padding: "10px 14px" }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
