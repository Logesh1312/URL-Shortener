import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function QrModal({ url, onClose, addToast }) {
  const canvasRef = useRef(null);
  const [fgColor, setFgColor] = useState("#6366F1"); // customizable FG color
  const [bgColor, setBgColor] = useState("#ffffff"); // customizable BG color
  const [ready, setReady] = useState(false);
  const shortUrl = `${import.meta.env.VITE_BASE_URL || "http://localhost:5000"}/${url.shortCode}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        shortUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: "H",
        },
        (err) => {
          if (!err) setReady(true);
        }
      );
    }
  }, [shortUrl, fgColor, bgColor]);

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${url.shortCode}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    addToast?.("QR Code downloaded successfully!", "success");
  };

  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const data = [new ClipboardItem({ [blob.type]: blob })];
        await navigator.clipboard.write(data);
        addToast?.("QR Image copied to clipboard!", "success");
      });
    } catch {
      addToast?.("Clipboard copy not supported by your browser.", "error");
    }
  };

  const shareLink = async () => {
    const shareData = {
      title: "Shortened Link QR Code",
      text: `Check out my shortened link: ${shortUrl}`,
      url: shortUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(shortUrl);
      addToast?.("Link copied to clipboard (sharing not supported by browser)", "info");
    }
  };

  const qrColors = [
    { label: "Indigo", value: "#6366F1" },
    { label: "Purple", value: "#8B5CF6" },
    { label: "Cyan", value: "#06B6D4" },
    { label: "Emerald", value: "#10B981" },
    { label: "Classic Dark", value: "#0F172A" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ textAlign: "center", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">📱 Custom QR Code</h3>
        <p style={{ color: "var(--text2)", fontSize: 13, wordBreak: "break-all", marginBottom: 16 }}>
          {shortUrl}
        </p>

        {/* QR Canvas Container */}
        <div className="qr-display" style={{ marginBottom: 20 }}>
          <div className="qr-frame" style={{ background: "#ffffff", padding: 12, borderRadius: 12 }}>
            <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
          </div>
        </div>

        {/* Customize Colors */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
            Customize QR Color
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {qrColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setFgColor(color.value)}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  background: fgColor === color.value ? "var(--accent)" : "var(--surface2)",
                  color: fgColor === color.value ? "#ffffff" : "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                }}
              >
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color.value, marginRight: 6 }} />
                {color.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions Button Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={download} disabled={!ready}>
              ⬇️ Download PNG
            </button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={copyImage} disabled={!ready}>
              📋 Copy QR Image
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={shareLink}>
              📤 Share URL & QR
            </button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
