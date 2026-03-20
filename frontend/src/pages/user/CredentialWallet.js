/**
 * TrustBridge — Credential Wallet
 * Full-width inside DashboardLayout · tilt cards · trust rings · design system
 * All functionality preserved: filter, sync, copy ID, view doc, DigiLocker
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { credentialAPI, digilockerAPI } from "../../services/api";
import DashboardLayout from "../../components/common/DashboardLayout";

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────────────────────────────────────── */
const T = {
  jade: "#2dce7a",
  emerald: "#0ea55e",
  forest: "#076b3c",
  deep: "#043d22",
  muted: "#5a7d6a",
  glass: "rgba(255,255,255,0.74)",
  glassBorder: "rgba(255,255,255,0.58)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Fix Cloudinary PDF URL — /image/upload/ → /raw/upload/
───────────────────────────────────────────────────────────────────────────── */
const getDocUrl = (url) => {
  if (!url) return url;
  const isPdf = url.toLowerCase().includes(".pdf");
  if (isPdf && url.includes("/image/upload/"))
    return url.replace("/image/upload/", "/raw/upload/");
  return url;
};

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────────────────────── */
const STATUS = {
  verified: { emoji: "✅", label: "Verified", bg: "rgba(45,206,122,0.1)", border: "rgba(45,206,122,0.25)", color: "#076b3c", gradient: "linear-gradient(135deg,#2dce7a,#0ea55e)" },
  pending: { emoji: "⏳", label: "Pending", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#92400e", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
  rejected: { emoji: "❌", label: "Rejected", bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.2)", color: "#991b1b", gradient: "linear-gradient(135deg,#ef4444,#dc2626)" },
  revoked: { emoji: "🚫", label: "Revoked", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)", color: "#374151", gradient: "linear-gradient(135deg,#6b7280,#4b5563)" },
};
const getStatus = (s) => STATUS[s] || STATUS.pending;

/* ─────────────────────────────────────────────────────────────────────────────
   TILT CARD
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, style: extra = {}, intensity = 7 }) {
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
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.015)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "12px 18px 40px rgba(7,107,60,0.13), 0 4px 14px rgba(7,107,60,0.07)"
          : "5px 7px 22px rgba(7,107,60,0.08), 0 2px 5px rgba(7,107,60,0.05)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TRUST RING
───────────────────────────────────────────────────────────────────────────── */
function TrustRing({ score = 0, size = 54 }) {
  const r = (size / 2) - 5;
  const c = 2 * Math.PI * r;
  const color = score >= 75 ? T.emerald : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(45,206,122,0.14)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${(score / 100) * c} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: size > 60 ? 14 : 11, color, fontFamily: "'DM Sans',sans-serif"
      }}>
        {score}%
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ACTION PILL BUTTON
───────────────────────────────────────────────────────────────────────────── */
function ActionPill({ onClick, href, children, accent = "green", disabled }) {
  const [hov, setHov] = useState(false);
  const colors = {
    green: { bg: "rgba(45,206,122,0.1)", hbg: "rgba(45,206,122,0.2)", color: T.forest },
    blue: { bg: "rgba(59,130,246,0.1)", hbg: "rgba(59,130,246,0.18)", color: "#1d4ed8" },
    gray: { bg: "rgba(107,114,128,0.08)", hbg: "rgba(107,114,128,0.15)", color: "#374151" },
    red: { bg: "rgba(239,68,68,0.08)", hbg: "rgba(239,68,68,0.15)", color: "#991b1b" },
  };
  const c = colors[accent] || colors.green;
  const style = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 13px", borderRadius: 100,
    background: hov && !disabled ? c.hbg : c.bg,
    border: `1px solid ${hov && !disabled ? c.color + "44" : c.color + "22"}`,
    color: disabled ? "#9ca3af" : c.color,
    fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    transition: "all 0.18s ease",
    transform: hov && !disabled ? "translateY(-1px)" : "translateY(0)",
    boxShadow: hov && !disabled ? `0 4px 12px ${c.color}22` : "none",
    whiteSpace: "nowrap",
  };
  if (href) return (
    <a href={href} target="_blank" rel="noreferrer" style={style}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </a>
  );
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={style}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CREDENTIAL CARD
───────────────────────────────────────────────────────────────────────────── */
function CredentialCard({ cred, onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = getStatus(cred.status);

  const copy = async () => {
    await navigator.clipboard.writeText(cred.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sync = async () => {
    setSyncing(true);
    try {
      await digilockerAPI.syncCredential(cred._id);
      toast.success("Synced to DigiLocker! 📱");
      onSync(cred._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Sync failed");
    } finally { setSyncing(false); }
  };

  const issuedDate = cred.issuedAt
    ? new Date(cred.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <TiltCard style={{ height: "100%" }}>
      <div style={{ padding: "22px 22px" }}>

        {/* Status gradient bar */}
        <div style={{ height: 3, borderRadius: 100, marginBottom: 18, background: s.gradient }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0, flex: 1 }}>
            {/* Status icon box */}
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: s.bg, border: `1.5px solid ${s.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: `0 4px 12px ${s.border}`,
            }}>{s.emoji}</div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontWeight: 800, fontSize: 14.5, color: T.deep,
                letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {cred.title}
              </p>
              <p style={{ fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "capitalize" }}>
                {cred.category}
                {(cred.metadata?.institution || cred.issuer?.organization) &&
                  ` · ${cred.metadata?.institution || cred.issuer?.organization}`}
              </p>
            </div>
          </div>

          {/* Trust ring — only for verified */}
          {cred.status === "verified" && cred.trustScore > 0 && (
            <TrustRing score={cred.trustScore} size={52} />
          )}
        </div>

        {/* Badges row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 11px", borderRadius: 100, fontSize: 11.5, fontWeight: 800,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            textTransform: "capitalize",
          }}>{s.label}</span>

          {cred.syncedToDigiLocker && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 11px", borderRadius: 100, fontSize: 11.5, fontWeight: 700,
              background: "rgba(59,130,246,0.1)", color: "#1d4ed8",
              border: "1px solid rgba(59,130,246,0.2)"
            }}>
              📱 DigiLocker
            </span>
          )}
          {cred.issuer?.name && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 11px", borderRadius: 100, fontSize: 11.5, fontWeight: 700,
              background: "rgba(45,206,122,0.08)", color: T.forest,
              border: "1px solid rgba(45,206,122,0.18)"
            }}>
              🏛️ {cred.issuer.name}
            </span>
          )}
        </div>

        {/* Verified details */}
        {cred.status === "verified" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {issuedDate && (
              <div style={{
                background: "rgba(45,206,122,0.07)", borderRadius: 12,
                padding: "9px 12px", border: "1px solid rgba(45,206,122,0.15)"
              }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em",
                  textTransform: "uppercase", marginBottom: 3
                }}>Issued</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.forest }}>{issuedDate}</p>
              </div>
            )}
            {cred.expiresAt && (
              <div style={{
                background: "rgba(245,158,11,0.07)", borderRadius: 12,
                padding: "9px 12px", border: "1px solid rgba(245,158,11,0.15)"
              }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em",
                  textTransform: "uppercase", marginBottom: 3
                }}>Expires</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                  {new Date(cred.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Rejection reason */}
        {cred.status === "rejected" && cred.rejectionReason && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            padding: "10px 14px", borderRadius: 14, marginBottom: 14,
            background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)"
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 12.5, color: "#991b1b", fontWeight: 500, lineHeight: 1.5 }}>
              {cred.rejectionReason}
            </p>
          </div>
        )}

        {/* Credential ID */}
        <div style={{
          background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "8px 12px",
          marginBottom: 14, border: "1px solid rgba(45,206,122,0.12)"
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: 2
          }}>Credential ID</p>
          <p style={{
            fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12,
            fontWeight: 600, color: T.forest
          }}>
            {cred.credentialId}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <ActionPill onClick={copy} accent="green">
            {copied ? "✓ Copied!" : "⎘ Copy ID"}
          </ActionPill>

          <ActionPill href={getDocUrl(cred.documentUrl)} accent="gray">
            📄 View Doc
          </ActionPill>

          {cred.status === "verified" && (
            <>
              <ActionPill href={cred.verificationUrl} accent="green">
                🔗 Verify Link
              </ActionPill>
              {!cred.syncedToDigiLocker && (
                <ActionPill onClick={sync} disabled={syncing} accent="blue">
                  {syncing ? "⟳ Syncing…" : "📱 Sync to DigiLocker"}
                </ActionPill>
              )}
            </>
          )}
        </div>

      </div>
    </TiltCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STAT BAR
───────────────────────────────────────────────────────────────────────────── */
function StatBar({ counts }) {
  const total = counts.all || 1;
  return (
    <div style={{ display: "flex", height: 6, borderRadius: 100, overflow: "hidden", gap: 2 }}>
      {[
        { count: counts.verified, color: "#2dce7a" },
        { count: counts.pending, color: "#f59e0b" },
        { count: counts.rejected, color: "#ef4444" },
        { count: counts.revoked, color: "#6b7280" },
      ].map((s, i) => s.count > 0 && (
        <div key={i} style={{
          flex: s.count / total, background: s.color,
          borderRadius: 100, transition: "flex 0.5s ease",
          minWidth: s.count > 0 ? 4 : 0,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────────────────── */
function EmptyState({ filter }) {
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <TiltCard>
        <div style={{ padding: "60px 40px", textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24, margin: "0 auto 20px",
            background: "linear-gradient(135deg,rgba(212,245,226,0.8),rgba(168,237,202,0.6))",
            border: "1.5px solid rgba(45,206,122,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32
          }}>
            {filter === "all" ? "👜" : filter === "verified" ? "✅" : filter === "pending" ? "⏳" : "📋"}
          </div>
          <p style={{ fontWeight: 800, fontSize: 18, color: T.deep, marginBottom: 8 }}>
            {filter === "all" ? "Your wallet is empty" : `No ${filter} credentials`}
          </p>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>
            {filter === "all"
              ? "Upload your first credential to get started with TrustBridge."
              : `You don't have any ${filter} credentials right now.`}
          </p>
          {filter === "all" && (
            <Link to="/upload" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 100,
              background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
              color: "white", fontWeight: 800, fontSize: 14, textDecoration: "none",
              boxShadow: "0 8px 24px rgba(45,206,122,0.3)",
              transition: "transform 0.18s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              ⬆ Upload Credential
            </Link>
          )}
        </div>
      </TiltCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function CredentialWallet() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    credentialAPI.getWallet()
      .then(({ data }) => setCredentials(data.credentials || []))
      .catch(() => toast.error("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, []);

  const handleSync = (id) =>
    setCredentials(prev => prev.map(c => c._id === id ? { ...c, syncedToDigiLocker: true } : c));

  const counts = {
    all: credentials.length,
    verified: credentials.filter(c => c.status === "verified").length,
    pending: credentials.filter(c => c.status === "pending").length,
    rejected: credentials.filter(c => c.status === "rejected").length,
    revoked: credentials.filter(c => c.status === "revoked").length,
  };

  const filtered = filter === "all" ? credentials : credentials.filter(c => c.status === filter);

  const FILTERS = [
    { key: "all", emoji: "📋", label: "All", count: counts.all },
    { key: "verified", emoji: "✅", label: "Verified", count: counts.verified },
    { key: "pending", emoji: "⏳", label: "Pending", count: counts.pending },
    { key: "rejected", emoji: "❌", label: "Rejected", count: counts.rejected },
    { key: "revoked", emoji: "🚫", label: "Revoked", count: counts.revoked },
  ];

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }
          @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer2 { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

          .shimmer-text {
            background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .skel {
            background:linear-gradient(90deg,rgba(212,245,226,0.6) 25%,rgba(168,237,202,0.5) 50%,rgba(212,245,226,0.6) 75%);
            background-size:200% 100%; animation:shimmer2 1.4s infinite; border-radius:22px;
          }
          .filter-btn { transition:all 0.22s cubic-bezier(.16,1,.3,1); }
          .cred-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
          @media (max-width:1200px) { .cred-grid { grid-template-columns:repeat(2,1fr); } }
          @media (max-width:700px)  { .cred-grid { grid-template-columns:1fr; } }
        `}</style>

        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 26, padding: "30px 36px", marginBottom: 24,
          background: "linear-gradient(135deg,#076b3c 0%,#0ea55e 45%,#2dce7a 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden",
          boxShadow: "0 16px 48px rgba(7,107,60,0.22)",
        }}>
          <div style={{
            position: "absolute", top: -50, right: -50, width: 200, height: 200,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -25, right: -25, width: 130, height: 130,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", pointerEvents: "none"
          }} />

          <div>
            <p style={{
              fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.65)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6
            }}>MY CREDENTIAL WALLET</p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(20px,2.5vw,30px)", color: "white",
              letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4
            }}>
              {counts.all} Credential{counts.all !== 1 ? "s" : ""}
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", fontWeight: 400 }}>
              {counts.verified} verified · {counts.pending} pending · {counts.rejected} rejected
            </p>
            {counts.all > 0 && (
              <div style={{ marginTop: 12, maxWidth: 280 }}>
                <StatBar counts={counts} />
              </div>
            )}
          </div>

          <Link to="/upload" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 24px", borderRadius: 100,
            background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.45)",
            color: "white", fontWeight: 800, fontSize: 14, textDecoration: "none",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <span style={{ fontSize: 16 }}>⬆</span> Upload New
          </Link>
        </div>

        {/* ── FILTER TABS ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
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
                    ? "linear-gradient(135deg,#2dce7a,#0ea55e)"
                    : "rgba(255,255,255,0.7)",
                  color: active ? "white" : T.muted,
                  boxShadow: active
                    ? "0 6px 20px rgba(45,206,122,0.28), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 2px 8px rgba(7,107,60,0.07)",
                  border: active ? "none" : "1.5px solid rgba(45,206,122,0.18)",
                  transform: active ? "translateY(-1px)" : "translateY(0)",
                }}>
                <span style={{ fontSize: 15 }}>{emoji}</span>
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  background: active ? "rgba(255,255,255,0.25)" : "rgba(45,206,122,0.12)",
                  color: active ? "white" : T.forest,
                  padding: "1px 7px", borderRadius: 100,
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── CREDENTIAL GRID ──────────────────────────────────────────── */}
        {loading ? (
          <div className="cred-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skel" style={{ height: 240 }} />
            ))}
          </div>
        ) : (
          <div className="cred-grid">
            {filtered.length === 0
              ? <EmptyState filter={filter} />
              : filtered.map((cred, i) => (
                <div key={cred._id} style={{
                  animation: `fadeUp 0.5s ${i * 40}ms cubic-bezier(.16,1,.3,1) both`,
                }}>
                  <CredentialCard cred={cred} onSync={handleSync} />
                </div>
              ))
            }
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
