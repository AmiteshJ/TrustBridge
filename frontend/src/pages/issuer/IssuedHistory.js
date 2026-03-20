/**
 * TrustBridge — Issuer Issued History
 * Blue design system · tilt cards · filter tabs · trust rings · full width
 * All functionality preserved: revoke with reason, status display
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { issuerAPI } from "../../services/api";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS — Blue theme
───────────────────────────────────────────────────────────────────────────── */
const T = {
  blue: "#3b82f6",
  royal: "#2563eb",
  navy: "#1d4ed8",
  deep: "#1e3a5f",
  muted: "#64748b",
  glass: "rgba(255,255,255,0.74)",
  glassBorder: "rgba(255,255,255,0.58)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────────────────────── */
const STATUS = {
  verified: { emoji: "✅", label: "Verified", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#15803d" },
  revoked: { emoji: "🚫", label: "Revoked", bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.22)", color: "#991b1b" },
  pending: { emoji: "⏳", label: "Pending", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#92400e" },
  rejected: { emoji: "❌", label: "Rejected", bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.22)", color: "#991b1b" },
};
const getStatus = (s) => STATUS[s] || STATUS.pending;

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
          ? "12px 18px 40px rgba(29,78,216,0.13), 0 4px 12px rgba(29,78,216,0.07)"
          : "5px 7px 22px rgba(29,78,216,0.08), 0 2px 5px rgba(29,78,216,0.05)",
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
   TRUST RING
───────────────────────────────────────────────────────────────────────────── */
function TrustRing({ score = 0, size = 48 }) {
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(59,130,246,0.15)" strokeWidth={3.5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={3.5}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontWeight: 800, fontSize: 10.5, color,
        fontFamily: "'DM Sans',sans-serif"
      }}>
        {score}%
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FLOAT INPUT
───────────────────────────────────────────────────────────────────────────── */
function FloatInput({ label, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const hasVal = String(value || "").length > 0;
  const lifted = focused || hasVal;

  return (
    <div style={{ position: "relative" }}>
      <label style={{
        position: "absolute", left: 14, top: lifted ? 7 : "50%",
        transform: lifted ? "translateY(0) scale(0.78)" : "translateY(-50%) scale(1)",
        transformOrigin: "left top", fontWeight: 700, fontSize: 13,
        color: focused ? "#ef4444" : T.muted,
        pointerEvents: "none", transition: "all 0.2s cubic-bezier(.16,1,.3,1)", zIndex: 2,
      }}>{label}</label>
      <input value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        style={{
          width: "100%",
          paddingTop: lifted ? 22 : 14, paddingBottom: 8,
          paddingLeft: 14, paddingRight: 14,
          border: `2px solid ${focused ? "#ef4444" : "rgba(239,68,68,0.22)"}`,
          borderRadius: 13, background: focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
          fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, color: T.deep,
          outline: "none", backdropFilter: "blur(8px)", transition: "all 0.2s ease",
          boxShadow: focused
            ? "0 0 0 4px rgba(239,68,68,0.08), inset 0 2px 4px rgba(0,0,0,0.03)"
            : "inset 0 2px 4px rgba(0,0,0,0.02)",
          caretColor: "#ef4444",
        }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HISTORY CARD
───────────────────────────────────────────────────────────────────────────── */
function HistoryCard({ cred, onRevoke, index }) {
  const [showRevoke, setShowRevoke] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const s = getStatus(cred.status);

  const revoke = async () => {
    if (!reason.trim()) { toast.error("Revocation reason is required"); return; }
    setLoading(true);
    try {
      await issuerAPI.revoke(cred._id, { reason });
      toast("Credential revoked");
      onRevoke(cred._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Revocation failed");
    } finally { setLoading(false); }
  };

  const issuedDate = cred.issuedAt
    ? new Date(cred.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div style={{ animation: `fadeUp 0.45s ${index * 40}ms cubic-bezier(.16,1,.3,1) both` }}>
      <TiltCard>
        <div style={{ padding: "20px 22px" }}>

          {/* Status gradient bar */}
          <div style={{
            height: 3, borderRadius: 100, marginBottom: 16,
            background: cred.status === "verified"
              ? "linear-gradient(90deg,#22c55e,#16a34a,transparent)"
              : cred.status === "revoked"
                ? "linear-gradient(90deg,#ef4444,#dc2626,transparent)"
                : "linear-gradient(90deg,#3b82f6,#1d4ed8,transparent)"
          }} />

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 12, marginBottom: 12
          }}>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 }}>
              {/* Status icon */}
              <div style={{
                width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                background: s.bg, border: `1.5px solid ${s.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{s.emoji}</div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  fontWeight: 800, fontSize: 14.5, color: T.deep,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  letterSpacing: "-0.01em", marginBottom: 3
                }}>
                  {cred.title}
                </p>
                <p style={{ fontSize: 12.5, color: T.muted, fontWeight: 500, marginBottom: 1 }}>
                  <span style={{ fontWeight: 700, color: T.navy }}>{cred.owner?.name}</span>
                  {" · "}{cred.owner?.email}
                </p>
                <p style={{ fontSize: 12, color: "rgba(100,116,139,0.7)" }}>
                  <span style={{ textTransform: "capitalize" }}>{cred.category}</span>
                  {" · Issued "}{issuedDate}
                </p>
              </div>
            </div>

            {/* Right: status badge + trust ring */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "flex-end", gap: 8, flexShrink: 0
            }}>
              <span style={{
                fontSize: 11.5, fontWeight: 800, padding: "4px 12px", borderRadius: 100,
                background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                textTransform: "capitalize", whiteSpace: "nowrap",
              }}>{s.label}</span>
              {cred.status === "verified" && cred.trustScore > 0 && (
                <TrustRing score={cred.trustScore} size={46} />
              )}
            </div>
          </div>

          {/* Revocation reason if revoked */}
          {cred.status === "revoked" && cred.revocationReason && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              padding: "10px 14px", borderRadius: 13, marginBottom: 12,
              background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 12.5, color: "#991b1b", fontWeight: 500, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700 }}>Revocation reason:</span> {cred.revocationReason}
              </p>
            </div>
          )}

          {/* Revoke action — only for verified */}
          {cred.status === "verified" && (
            <div style={{ borderTop: "1.5px solid rgba(59,130,246,0.1)", paddingTop: 12 }}>
              {!showRevoke ? (
                <button onClick={() => setShowRevoke(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 10, border: "none",
                    background: "rgba(239,68,68,0.08)", color: "#991b1b",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12.5,
                    cursor: "pointer", transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  ⚠️ Revoke Credential
                </button>
              ) : (
                <div style={{ animation: "slideIn 0.25s cubic-bezier(.16,1,.3,1) both" }}>
                  <FloatInput
                    label="⚠️ Revocation Reason (required)"
                    value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Why is this credential being revoked?"
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button onClick={revoke}
                      disabled={loading || !reason.trim()}
                      style={{
                        flex: 1, padding: "11px 16px", borderRadius: 13, border: "none",
                        background: loading || !reason.trim()
                          ? "rgba(239,68,68,0.3)"
                          : "linear-gradient(135deg,#ef4444,#dc2626)",
                        color: "white", fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 800, fontSize: 13.5,
                        cursor: loading || !reason.trim() ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        boxShadow: !loading && reason.trim()
                          ? "0 6px 18px rgba(239,68,68,0.28)" : "none",
                        transition: "all 0.18s",
                      }}>
                      {loading
                        ? <><Spinner color="rgba(255,255,255,0.5)" /> Revoking…</>
                        : "✕ Confirm Revoke"
                      }
                    </button>
                    <button onClick={() => { setShowRevoke(false); setReason(""); }}
                      style={{
                        flex: 1, padding: "11px 16px", borderRadius: 13,
                        border: "2px solid rgba(100,116,139,0.2)",
                        background: "rgba(255,255,255,0.6)", color: T.muted,
                        fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13.5,
                        cursor: "pointer", transition: "all 0.18s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.85)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.6)"}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </TiltCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SPINNER
───────────────────────────────────────────────────────────────────────────── */
function Spinner({ color = "rgba(255,255,255,0.4)" }) {
  return (
    <div style={{
      width: 15, height: 15, borderRadius: "50%",
      border: `2.5px solid ${color}`, borderTopColor: "white",
      animation: "spin 0.8s linear infinite", flexShrink: 0
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function IssuedHistory() {
  const [creds, setCreds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    issuerAPI.getHistory()
      .then(({ data }) => setCreds(data.credentials || []))
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = (id) => {
    setCreds(prev => prev.map(c => c._id === id ? { ...c, status: "revoked" } : c));
  };

  const counts = {
    all: creds.length,
    verified: creds.filter(c => c.status === "verified").length,
    revoked: creds.filter(c => c.status === "revoked").length,
    rejected: creds.filter(c => c.status === "rejected").length,
  };

  const filtered = filter === "all" ? creds : creds.filter(c => c.status === filter);

  const FILTERS = [
    { key: "all", emoji: "📋", label: "All", count: counts.all },
    { key: "verified", emoji: "✅", label: "Verified", count: counts.verified },
    { key: "revoked", emoji: "🚫", label: "Revoked", count: counts.revoked },
    { key: "rejected", emoji: "❌", label: "Rejected", count: counts.rejected },
  ];

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }
          @keyframes spin    { to{transform:rotate(360deg)} }
          @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer2{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

          .shimmer-blue {
            background:linear-gradient(90deg,#1d4ed8 0%,#3b82f6 30%,#93c5fd 50%,#3b82f6 70%,#1d4ed8 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .skel {
            background:linear-gradient(90deg,rgba(219,234,254,0.7) 25%,rgba(191,219,254,0.55) 50%,rgba(219,234,254,0.7) 75%);
            background-size:200% 100%; animation:shimmer2 1.4s infinite; border-radius:24px;
          }
          .filter-btn { transition:all 0.22s cubic-bezier(.16,1,.3,1); }

          @media (max-width:768px) {
            .history-grid { grid-template-columns:1fr !important; }
          }
        `}</style>

        {/* ── HERO BANNER ──────────────────────────────────────────── */}
        <div style={{
          borderRadius: 26, padding: "26px 34px", marginBottom: 22,
          background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 45%,#3b82f6 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14, position: "relative", overflow: "hidden",
          boxShadow: "0 14px 44px rgba(29,78,216,0.28)",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 180, height: 180,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -20, right: -20, width: 110, height: 110,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.16)", pointerEvents: "none"
          }} />

          <div>
            <p style={{
              fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8
            }}>
              ISSUED HISTORY
            </p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(20px,2.5vw,30px)", color: "white",
              letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4
            }}>
              Credential Records
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
              {loading ? "Loading…"
                : `${counts.all} total · ${counts.verified} verified · ${counts.revoked} revoked`}
            </p>
          </div>

          {/* Stats pills */}
          {!loading && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Verified", value: counts.verified, bg: "rgba(34,197,94,0.22)", border: "rgba(34,197,94,0.4)" },
                { label: "Revoked", value: counts.revoked, bg: "rgba(239,68,68,0.22)", border: "rgba(239,68,68,0.4)" },
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
                    ? "linear-gradient(135deg,#3b82f6,#1d4ed8)"
                    : "rgba(255,255,255,0.7)",
                  color: active ? "white" : T.muted,
                  boxShadow: active
                    ? "0 6px 20px rgba(29,78,216,0.28), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 2px 8px rgba(29,78,216,0.07)",
                  border: active ? "none" : "1.5px solid rgba(59,130,246,0.18)",
                  transform: active ? "translateY(-1px)" : "translateY(0)",
                }}>
                <span style={{ fontSize: 15 }}>{emoji}</span>
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  background: active ? "rgba(255,255,255,0.25)" : "rgba(59,130,246,0.12)",
                  color: active ? "white" : T.navy,
                  padding: "1px 7px", borderRadius: 100,
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ──────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skel" style={{ height: 110 }} />)}
          </div>

        ) : filtered.length === 0 ? (
          <TiltCard>
            <div style={{ padding: "64px 40px", textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: 24, margin: "0 auto 18px",
                background: "rgba(59,130,246,0.1)", border: "1.5px solid rgba(59,130,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32
              }}>
                {filter === "all" ? "📋" : filter === "verified" ? "✅" : filter === "revoked" ? "🚫" : "❌"}
              </div>
              <p style={{ fontWeight: 800, fontSize: 18, color: T.deep, marginBottom: 8 }}>
                {filter === "all" ? "No credentials issued yet" : `No ${filter} credentials`}
              </p>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65 }}>
                {filter === "all"
                  ? "Credentials you approve from the queue will appear here."
                  : `You don't have any ${filter} credentials yet.`}
              </p>
            </div>
          </TiltCard>

        ) : (
          <div className="history-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16,
          }}>
            {filtered.map((cred, i) => (
              <HistoryCard key={cred._id} cred={cred} onRevoke={handleRevoke} index={i} />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
