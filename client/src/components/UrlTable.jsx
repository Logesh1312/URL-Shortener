import React, { useState } from "react";

export default function UrlTable({
  urls,
  loading,
  onDelete,
  onEdit,
  onQR,
  onAnalytics,
  onCopy,
  onToggleFavorite,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "starred", "active", "expired"
  const [sort, setSort] = useState("recent"); // "recent", "clicks-desc", "clicks-asc"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="skeleton" style={{ height: 32, width: 80 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter & Search
  const filtered = urls
    .filter((u) => {
      const matchesSearch =
        u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
        u.shortCode.toLowerCase().includes(search.toLowerCase()) ||
        (u.customAlias && u.customAlias.toLowerCase().includes(search.toLowerCase()));

      const isExpired = u.expiryDate && new Date() > new Date(u.expiryDate);

      if (filter === "starred") return matchesSearch && u.isFavorite;
      if (filter === "active") return matchesSearch && !isExpired;
      if (filter === "expired") return matchesSearch && isExpired;
      return matchesSearch;
    })
    // Sort
    .sort((a, b) => {
      if (sort === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "clicks-desc") return b.clicks - a.clicks;
      if (sort === "clicks-asc") return a.clicks - b.clicks;
      return 0;
    });

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const baseRedirectUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search and Filters panel */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <input
              id="search-links"
              type="text"
              placeholder="🔍 Search original URL, short code or custom alias..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: 16 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "auto", padding: "10px 14px", fontSize: 13 }}
            >
              <option value="all">All Statuses</option>
              <option value="starred">Starred Only</option>
              <option value="active">Active Links</option>
              <option value="expired">Expired Links</option>
            </select>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "auto", padding: "10px 14px", fontSize: 13 }}
            >
              <option value="recent">Recently Created</option>
              <option value="clicks-desc">Most Clicked</option>
              <option value="clicks-asc">Least Clicked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {paginatedItems.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🔗</div>
          <div className="empty-state-title">No matching links found</div>
          <div className="empty-state-desc">
            {search ? "No results matched your search." : "You haven't shortened any links yet!"}
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>★</th>
                  <th>Original URL</th>
                  <th>Short Link</th>
                  <th>Clicks</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((u) => {
                  const shortLink = `${baseRedirectUrl}/${u.shortCode}`;
                  const isExpired = u.expiryDate && new Date() > new Date(u.expiryDate);

                  return (
                    <tr key={u._id}>
                      <td>
                        <button
                          className={`star-btn${u.isFavorite ? " starred" : ""}`}
                          onClick={() => onToggleFavorite(u)}
                          title={u.isFavorite ? "Remove Star" : "Star Link"}
                        >
                          ★
                        </button>
                      </td>
                      <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>
                          {u.originalUrl}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <a href={shortLink} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                            /{u.shortCode}
                          </a>
                          <button
                            className="btn-ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(shortLink);
                              onCopy();
                            }}
                            style={{ padding: "4px 8px", fontSize: 10, borderRadius: 4 }}
                          >
                            📋 Copy
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: 12, fontWeight: 700 }}>
                          {u.clicks}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {isExpired ? (
                          <span className="badge badge-red">Expired</span>
                        ) : u.password ? (
                          <span className="badge badge-yellow" title="Password Protected">🔒 Protected</span>
                        ) : (
                          <span className="badge badge-green">Active</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            className="btn-ghost"
                            onClick={() => onQR(u)}
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            title="QR Code"
                          >
                            📱 QR
                          </button>
                          <button
                            className="btn-ghost"
                            onClick={() => onAnalytics(u)}
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            title="Analytics"
                          >
                            📊 Stats
                          </button>
                          <button
                            className="btn-ghost"
                            onClick={() => onEdit(u)}
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            title="Edit Link"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => onDelete(u)}
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            title="Delete Link"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> URLs
              </div>
              <div className="pagination-buttons">
                <button
                  className="btn-ghost pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ◀ Prev
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={currentPage === index + 1 ? "btn-primary pagination-btn" : "btn-ghost pagination-btn"}
                    onClick={() => handlePageChange(index + 1)}
                    style={{ minWidth: 32, padding: "6px 0" }}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="btn-ghost pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
