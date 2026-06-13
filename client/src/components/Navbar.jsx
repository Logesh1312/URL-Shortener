import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar({ onSelectTab }) {
  const { username, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="dash-navbar">
      <div className="nav-actions">
        <ThemeToggle />
        
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <div className="profile-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="dash-avatar">
              {username?.[0] || "U"}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              {username}
            </span>
            <span style={{ fontSize: 10, color: "var(--text2)" }}>▼</span>
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-info">
                <div className="profile-dropdown-name">{username}</div>
                <div className="profile-dropdown-sub">Premium Member</div>
              </div>
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onSelectTab("settings");
                }}
              >
                👤 Profile Settings
              </button>
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onSelectTab("settings");
                }}
              >
                ⚙️ Preference Settings
              </button>
              <button
                className="profile-dropdown-item danger-item"
                style={{ borderTop: "1px solid var(--border)" }}
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
