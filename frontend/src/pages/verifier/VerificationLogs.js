/**
 * TrustBridge — Verifier Verification Logs
 * Crimson/red theme · tilt cards · filter tabs · full width
 * All functionality preserved: log listing, result display, fraud detection
 */
import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { verifierAPI } from "../../services/api";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS — Crimson theme
───────────────────────────────────────────────────────────────────────────── */
const T = {
  rose: "#f43f5e",
  crimson: "#e11d48",
  ruby: "#be123c",
  deep: "#4c0519",
  muted: "#6b7280",
  glass: "rgba(255,255,255,0.74)",
  glassBorder: "rgba(255,255,255,0.58)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   RESULT CONFIG
───────────────────────────────────────────────────────────────────────────── */
const RESULT_CFG = {
  valid: { emoji: "✅", label: "Valid", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#15803d" },
  invalid: { emoji: "❌", label: "Invalid", bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.22)", color: "#991b1b" },
  tampered: { emoji: "🚨", label: "Tampered", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#991b1b" },
  expired: { emoji: "⏰", label: "Expired", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#92400e" },
  revoked: { emoji: "🚫", label: "Revoked", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.22)", color: "#374151" },
  not_found: { emoji: "🔍", label: "Not Found", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)", color: "#6b7280" },
};
const getCfg = (r) => RESULT_CFG[r] || RESULT_CFG.not_found;

/* ─────────────────────────────────────────────────────────────────────────────
   METHOD CONFIG
───────────────────────────────────────────────────────────────────────────── */
const METHOD_CFG = {
  id: { emoji: "🔢", label: "Credential ID" },
  qr: { emoji: "📷", label: "QR Code" },
  link: { emoji: "🔗", label: "Verify Link" },
};
const getMethod = (m) => METHOD_CFG[m?.toLowerCase()] || { emoji: "🔍", label: m?.toUpperCase() || "Unknown" };

/* ─────────────────────────────────────────────────────────────────────────────
   TILT CARD
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, style: extra = {}, intensity = 6 }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 50, sy: 50 });
  const [hov, setHov] = useState(false);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (y - 0.5) * -intensity, ry: (x - 0.5) * intensity, sx: x * 100, sy: y * 100 });
  };

  return (
    <div ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ rx: 0, ry: 0, sx: 50, sy: 50 }); }}
      style={{
        position: "relative", overflow: "hidden",
        background: T.glass, border: `1.5px solid ${T.glassBorder}`,
        borderRadius: 24, backdropFilter: "blur(20px)",
        transition: hov ? "transform 0.08s ease, box-shadow 0.08s ease"
          : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
        transform: hov
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.012)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "12px 18px 40px rgba(190,18,60,0.12), 0 4px 12px rgba(190,18,60,0.07)"
          : "5px 7px 22px rgba(190,18,60,0.07), 0 2px 5px rgba(190,18,60,0.04)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.2) 0%, transparent 60%)`
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOG ROW
───────────────────────────────────────────────────────────────────────────── */
function LogRow({ log, index }) {
  const [hov, setHov] = useState(false);
  const cfg = getCfg(log.result);
  const method = getMethod(log.verificationMethod);

  const date = new Date(log.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const time = new Date(log.createdAt).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{ animation: `fadeUp 0.4s ${index * 35}ms cubic-bezier(.16,1,.3,1) both` }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", borderRadius: 16, gap: 12,
        background: hov ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.6)",
        border: "1.5px solid rgba(255,255,255,0.6)",
        transition: "all 0.18s ease",
        transform: hov ? "translateX(4px)" : "translateX(0)",
        boxShadow: hov ? "6px 8px 24px rgba(190,18,60,0.1)" : "3px 4px 14px rgba(190,18,60,0.05)",
      }}>

        {/* Left — icon + info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
            background: cfg.bg, border: `1.5px solid ${cfg.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>{cfg.emoji}</div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontWeight: 700, fontSize: 14, color: T.deep,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              letterSpacing: "-0.01em", marginBottom: 3
            }}>
              {log.credential?.title || log.credentialId || "Unknown Credential"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Method pill */}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 100,
                background: "rgba(244,63,94,0.08)", color: T.ruby,
                border: "1px solid rgba(244,63,94,0.2)",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                {method.emoji} {method.label}
              </span>
              {/* Owner */}
              {log.credential?.owner?.name && (
                <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>
                  {log.credential.owner.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right — result + fraud + date */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Fraud badge */}
          {log.fraudDetected && (
            <span style={{
              fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 100,
              background: "rgba(239,68,68,0.12)", color: "#991b1b",
              border: "1px solid rgba(239,68,68,0.3)",
              animation: "pulse-badge 2s infinite",
            }}>
              🚨 FRAUD
            </span>
          )}

          {/* Result badge */}
          <span style={{
            fontSize: 11.5, fontWeight: 800, padding: "4px 12px", borderRadius: 100,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            textTransform: "capitalize", whiteSpace: "nowrap",
          }}>{cfg.label}</span>

          {/* Date */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>{date}</p>
            <p style={{ fontSize: 11, color: "rgba(107,114,128,0.65)" }}>{time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function VerificationLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    verifierAPI.getLogs()
      .then(({ data }) => setLogs(data.logs || []))
      .catch(() => toast.error("Failed to load logs"))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    all: logs.length,
    valid: logs.filter(l => l.result === "valid").length,
    invalid: logs.filter(l => ["invalid", "tampered"].includes(l.result)).length,
    expired: logs.filter(l => l.result === "expired").length,
    revoked: logs.filter(l => l.result === "revoked").length,
    fraud: logs.filter(l => l.fraudDetected).length,
  };

  const filtered = filter === "all" ? logs
    : filter === "invalid" ? logs.filter(l => ["invalid", "tampered"].includes(l.result))
      : filter === "fraud" ? logs.filter(l => l.fraudDetected)
        : logs.filter(l => l.result === filter);

  const FILTERS = [
    { key: "all", emoji: "📋", label: "All", count: counts.all },
    { key: "valid", emoji: "✅", label: "Valid", count: counts.valid },
    { key: "invalid", emoji: "❌", label: "Invalid", count: counts.invalid },
    { key: "expired", emoji: "⏰", label: "Expired", count: counts.expired },
    { key: "revoked", emoji: "🚫", label: "Revoked", count: counts.revoked },
    { key: "fraud", emoji: "🚨", label: "Fraud", count: counts.fraud },
  ];

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }
          @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes shimmer2 { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          @keyframes pulse-badge { 0%,100%{opacity:1} 50%{opacity:0.6} }

          .shimmer-red {
            background:linear-gradient(90deg,#be123c 0%,#f43f5e 30%,#fda4af 50%,#f43f5e 70%,#be123c 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .skel {
            background:linear-gradient(90deg,rgba(255,228,230,0.7) 25%,rgba(254,205,211,0.55) 50%,rgba(255,228,230,0.7) 75%);
            background-size:200% 100%; animation:shimmer2 1.4s infinite; border-radius:16px;
          }
          .filter-btn { transition:all 0.22s cubic-bezier(.16,1,.3,1); }
        `}</style>

        {/* ── HERO BANNER ──────────────────────────────────────────── */}
        <div style={{
          borderRadius: 26, padding: "26px 34px", marginBottom: 22,
          background: "linear-gradient(135deg,#4c0519 0%,#be123c 45%,#f43f5e 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14, position: "relative", overflow: "hidden",
          boxShadow: "0 14px 44px rgba(190,18,60,0.3)",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 180, height: 180,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -20, right: -20, width: 110, height: 110,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.16)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", bottom: -60, left: -40, width: 240, height: 240,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none"
          }} />

          <div>
            <p style={{
              fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8
            }}>
              VERIFICATION LOGS
            </p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(20px,2.5vw,30px)", color: "white",
              letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4
            }}>
              Activity History
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
              {loading ? "Loading…"
                : `${counts.all} verification${counts.all !== 1 ? "s" : ""} performed · ${counts.fraud} fraud alert${counts.fraud !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Stats pills */}
          {!loading && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Valid", value: counts.valid, bg: "rgba(34,197,94,0.22)", border: "rgba(34,197,94,0.4)" },
                { label: "Fraud", value: counts.fraud, bg: "rgba(239,68,68,0.28)", border: "rgba(239,68,68,0.5)" },
              ].map(({ label, value, bg, border }) => (
                <div key={label} style={{
                  padding: "8px 16px", borderRadius: 100,
                  background: bg, border: `1.5px solid ${border}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "white" }}>{value}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FILTER TABS ──────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {FILTERS.map(({ key, emoji, label, count }) => {
            const active = filter === key;
            return (
              <button key={key} className="filter-btn"
                onClick={() => setFilter(key)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 18px", borderRadius: 100, border: "none",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13,
                  cursor: "pointer",
                  background: active
                    ? "linear-gradient(135deg,#f43f5e,#be123c)"
                    : "rgba(255,255,255,0.7)",
                  color: active ? "white" : T.muted,
                  boxShadow: active
                    ? "0 6px 20px rgba(190,18,60,0.28), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 2px 8px rgba(190,18,60,0.07)",
                  border: active ? "none" : "1.5px solid rgba(244,63,94,0.18)",
                  transform: active ? "translateY(-1px)" : "translateY(0)",
                }}>
                <span style={{ fontSize: 15 }}>{emoji}</span>
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  background: active ? "rgba(255,255,255,0.25)" : "rgba(244,63,94,0.1)",
                  color: active ? "white" : T.ruby,
                  padding: "1px 7px", borderRadius: 100,
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ──────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skel" style={{ height: 68 }} />)}
          </div>

        ) : filtered.length === 0 ? (
          <TiltCard>
            <div style={{ padding: "64px 40px", textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: 24, margin: "0 auto 18px",
                background: "rgba(244,63,94,0.08)", border: "1.5px solid rgba(244,63,94,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32
              }}>
                {filter === "fraud" ? "🚨" : filter === "valid" ? "✅" : "📋"}
              </div>
              <p style={{ fontWeight: 800, fontSize: 18, color: T.deep, marginBottom: 8 }}>
                {filter === "all" ? "No verifications yet" : `No ${filter} verifications`}
              </p>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, maxWidth: 340, margin: "0 auto" }}>
                {filter === "all"
                  ? "Credentials you verify from the dashboard will be logged here."
                  : `You don't have any ${filter} verification results yet.`}
              </p>
            </div>
          </TiltCard>

        ) : (
          <TiltCard intensity={3}>
            <div style={{ padding: "20px 18px" }}>
              {/* Top accent bar */}
              <div style={{
                height: 3, borderRadius: 100, marginBottom: 16,
                background: "linear-gradient(90deg,#f43f5e,#be123c,transparent)"
              }} />

              {/* Summary row */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 16, flexWrap: "wrap", gap: 8
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: T.muted,
                  letterSpacing: "0.06em", textTransform: "uppercase"
                }}>
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  {filter !== "all" ? ` · ${filter}` : ""}
                </p>
                <p style={{ fontSize: 12, color: "rgba(107,114,128,0.6)", fontWeight: 500 }}>
                  Most recent first
                </p>
              </div>

              {/* Log rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((log, i) => (
                  <LogRow key={log._id || i} log={log} index={i} />
                ))}
              </div>
            </div>
          </TiltCard>
        )}

      </div>
    </DashboardLayout>
  );
}
