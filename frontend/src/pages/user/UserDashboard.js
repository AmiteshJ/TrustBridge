/**
 * TrustBridge — User Dashboard
 * Full design system: tilt cards · morphing background · magnetic actions
 * All functionality preserved: wallet stats, 2FA toggle, DigiLocker, quick actions
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { credentialAPI, authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/common/DashboardLayout";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const T = {
  white: "#ffffff",
  foam: "#d4f5e2",
  mint: "#a8edca",
  jade: "#2dce7a",
  emerald: "#0ea55e",
  forest: "#076b3c",
  deep: "#043d22",
  muted: "#5a7d6a",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.55)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   TILT CARD
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, style: extra = {}, intensity = 8 }) {
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
        borderRadius: 26, backdropFilter: "blur(20px)",
        transition: hov
          ? "transform 0.08s ease, box-shadow 0.08s ease"
          : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
        transform: hov
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.015)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "14px 20px 44px rgba(7,107,60,0.14), 0 4px 14px rgba(7,107,60,0.08)"
          : "6px 8px 24px rgba(7,107,60,0.09), 0 2px 6px rgba(7,107,60,0.05)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 26, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────────────────── */
function StatCard({ emoji, label, value, gradient, sub, to }) {
  const inner = (
    <TiltCard>
      <div style={{ padding: "22px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 16,
            background: gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
            boxShadow: "0 4px 14px rgba(7,107,60,0.14)",
          }}>{emoji}</div>
          {to && (
            <div style={{
              width: 28, height: 28, borderRadius: 10,
              background: "rgba(45,206,122,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: T.emerald, fontWeight: 800,
              transition: "background 0.18s",
            }}>→</div>
          )}
        </div>
        <p style={{
          fontWeight: 800, fontSize: 32, color: T.deep,
          letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 5,
          fontFamily: "'DM Sans',sans-serif",
        }}>{value ?? "—"}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>{label}</p>
        {sub && <p style={{ fontSize: 11.5, color: "rgba(90,125,106,0.7)", marginTop: 2 }}>{sub}</p>}
      </div>
    </TiltCard>
  );

  return to
    ? <Link to={to} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
    : inner;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TRUST RING  (circular progress for trust score)
───────────────────────────────────────────────────────────────────────────── */
function TrustRing({ score = 0, size = 52 }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? T.emerald : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(45,206,122,0.15)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: size > 60 ? 15 : 11,
        color, fontFamily: "'DM Sans',sans-serif",
      }}>{score}%</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON  (for upload CTA)
───────────────────────────────────────────────────────────────────────────── */
function MagneticLink({ children, to, style: extra = {} }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  }, []);

  return (
    <Link to={to} ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setHov(false); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "11px 24px", borderRadius: 100,
        background: hov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.82)",
        color: T.forest,
        fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14,
        textDecoration: "none", border: "none",
        boxShadow: hov
          ? "0 12px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
        transform: hov ? `translate(${pos.x}px,${pos.y}px) scale(1.04)` : "translate(0,0) scale(1)",
        transition: "transform 0.08s ease, box-shadow 0.18s ease, background 0.18s ease",
        ...extra,
      }}>
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FADE UP
───────────────────────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.65s ${delay}ms cubic-bezier(.16,1,.3,1), transform 0.65s ${delay}ms cubic-bezier(.16,1,.3,1)`,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────────────────────── */
const STATUS = {
  verified: { bg: "rgba(45,206,122,0.12)", border: "rgba(45,206,122,0.25)", color: "#076b3c", emoji: "✅" },
  pending: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#92400e", emoji: "⏳" },
  rejected: { bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.2)", color: "#991b1b", emoji: "❌" },
  revoked: { bg: "rgba(107,114,128,0.09)", border: "rgba(107,114,128,0.2)", color: "#374151", emoji: "🚫" },
};
const getStatus = (s) => STATUS[s] || STATUS.pending;

/* ─────────────────────────────────────────────────────────────────────────────
   QUICK ACTION ROW
───────────────────────────────────────────────────────────────────────────── */
function QuickRow({ to, emoji, label }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} style={{ textDecoration: "none" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderRadius: 16,
        background: hov ? "rgba(45,206,122,0.08)" : "transparent",
        transition: "background 0.18s ease",
        cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: hov ? T.forest : T.deep }}>{label}</span>
        </div>
        <span style={{
          fontSize: 14, color: hov ? T.emerald : "rgba(90,125,106,0.4)",
          fontWeight: 800, transition: "all 0.18s",
          transform: hov ? "translateX(3px)" : "translateX(0)",
          display: "inline-block",
        }}>→</span>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
export default function UserDashboard() {
  const { user, updateUser } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    credentialAPI.getWallet()
      .then(({ data }) => setCredentials(data.credentials || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: credentials.length,
    verified: credentials.filter(c => c.status === "verified").length,
    pending: credentials.filter(c => c.status === "pending").length,
    rejected: credentials.filter(c => c.status === "rejected").length,
  };

  const avgTrust = counts.verified > 0
    ? Math.round(credentials.filter(c => c.status === "verified").reduce((s, c) => s + (c.trustScore || 0), 0) / counts.verified)
    : 0;

  const handle2FAToggle = async () => {
    setToggling(true);
    try {
      const { data } = await authAPI.toggle2FA();
      updateUser({ twoFactorEnabled: data.twoFactorEnabled });
      toast.success(data.message);
    } catch {
      toast.error("Failed to toggle 2FA");
    } finally {
      setToggling(false);
    }
  };

  const recent = credentials.slice(0, 5);

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes spin    { to{transform:rotate(360deg)} }
          @keyframes fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(45,206,122,0.4)} 70%{box-shadow:0 0 0 10px rgba(45,206,122,0)} 100%{box-shadow:0 0 0 0 rgba(45,206,122,0)} }
          .shimmer-text {
            background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .cred-row { transition:background 0.18s, transform 0.18s; border-radius:16px; }
          .cred-row:hover { background:rgba(45,206,122,0.06) !important; transform:translateX(4px); }
        `}</style>

        <div style={{ width: "100%", padding: "4px 0" }}>

          {/* ── HERO BANNER ────────────────────────────────────────────── */}
          <FadeUp>
            <div style={{
              borderRadius: 28, padding: "36px 40px", marginBottom: 28,
              background: "linear-gradient(135deg,#076b3c 0%,#0ea55e 45%,#2dce7a 100%)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 20, position: "relative", overflow: "hidden",
              boxShadow: "0 20px 60px rgba(7,107,60,0.25)",
            }}>
              {/* Decorative rings */}
              <div style={{
                position: "absolute", top: -60, right: -60, width: 240, height: 240,
                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
              }} />
              <div style={{
                position: "absolute", top: -30, right: -30, width: 160, height: 160,
                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", pointerEvents: "none"
              }} />
              <div style={{
                position: "absolute", top: "50%", left: "45%",
                fontSize: 120, opacity: 0.04, color: "white", lineHeight: 1,
                transform: "translateY(-50%)", userSelect: "none", fontWeight: 800
              }}>✦</div>

              <div>
                <p style={{
                  fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8
                }}>DASHBOARD</p>
                <h1 style={{
                  fontWeight: 800, fontSize: "clamp(22px,2.5vw,34px)", color: "white",
                  letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 6
                }}>
                  Welcome back,{" "}
                  <span style={{ color: "rgba(168,237,202,0.95)" }}>
                    {user?.name?.split(" ")[0]}!
                  </span>
                </h1>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.72)", fontWeight: 400 }}>
                  Manage your credential wallet, DigiLocker vault, and account security.
                </p>
              </div>

              <MagneticLink to="/upload">
                <span style={{ fontSize: 16 }}>⬆</span>
                Upload Credential
              </MagneticLink>
            </div>
          </FadeUp>

          {/* ── STAT CARDS ─────────────────────────────────────────────── */}
          <FadeUp delay={60}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}
              className="stats-responsive">
              <StatCard emoji="📋" label="Total Credentials" value={counts.total}
                gradient="linear-gradient(135deg,rgba(212,245,226,0.9),rgba(168,237,202,0.7))"
                sub="in your wallet" to="/wallet" />
              <StatCard emoji="✅" label="Verified" value={counts.verified}
                gradient="linear-gradient(135deg,rgba(187,247,208,0.9),rgba(134,239,172,0.7))"
                sub="authenticated" to="/wallet" />
              <StatCard emoji="⏳" label="Pending" value={counts.pending}
                gradient="linear-gradient(135deg,rgba(254,243,199,0.9),rgba(253,230,138,0.7))"
                sub="under review" to="/wallet" />
              <StatCard emoji="❌" label="Rejected" value={counts.rejected}
                gradient="linear-gradient(135deg,rgba(254,226,226,0.9),rgba(252,165,165,0.7))"
                sub="not approved" to="/wallet" />
            </div>
          </FadeUp>

          {/* ── MAIN GRID ──────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }} className="dash-main-grid">

            {/* LEFT — recent credentials */}
            <FadeUp delay={100}>
              <TiltCard style={{ height: "100%" }}>
                <div style={{ padding: "26px 28px" }}>

                  {/* Top bar */}
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 24,
                    background: "linear-gradient(90deg,#2dce7a,#0ea55e,transparent)"
                  }} />

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <div>
                      <h2 style={{
                        fontWeight: 800, fontSize: 17, color: T.deep,
                        letterSpacing: "-0.02em", marginBottom: 3
                      }}>Recent Credentials</h2>
                      <p style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>
                        {counts.total} total · {counts.verified} verified
                      </p>
                    </div>
                    <Link to="/wallet" style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "7px 16px", borderRadius: 100,
                      background: "rgba(45,206,122,0.1)", border: "1px solid rgba(45,206,122,0.2)",
                      fontSize: 12.5, fontWeight: 700, color: T.forest, textDecoration: "none",
                      transition: "all 0.18s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(45,206,122,0.18)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(45,206,122,0.1)"; }}>
                      View all →
                    </Link>
                  </div>

                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          height: 62, borderRadius: 16,
                          background: "linear-gradient(90deg,rgba(212,245,226,0.5) 25%,rgba(168,237,202,0.4) 50%,rgba(212,245,226,0.5) 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.4s infinite",
                        }} />
                      ))}
                    </div>
                  ) : recent.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 22, margin: "0 auto 16px",
                        background: "rgba(212,245,226,0.6)", border: "1.5px solid rgba(45,206,122,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                      }}>📋</div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: T.deep, marginBottom: 6 }}>
                        No credentials yet
                      </p>
                      <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
                        Upload your first credential to get started
                      </p>
                      <Link to="/upload" style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "10px 22px", borderRadius: 100,
                        background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
                        color: "white", fontWeight: 700, fontSize: 13.5,
                        textDecoration: "none",
                        boxShadow: "0 6px 20px rgba(45,206,122,0.3)",
                      }}>
                        Upload Credential →
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {recent.map((c, i) => {
                        const s = getStatus(c.status);
                        return (
                          <Link key={c._id} to="/wallet" style={{ textDecoration: "none" }}>
                            <div className="cred-row" style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "12px 16px",
                              background: "rgba(255,255,255,0.5)", border: `1px solid rgba(255,255,255,0.6)`,
                              animation: `fadeIn 0.4s ${i * 60}ms both`,
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                                <div style={{
                                  width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                                  background: s.bg, border: `1px solid ${s.border}`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 18,
                                }}>{s.emoji}</div>
                                <div style={{ minWidth: 0 }}>
                                  <p style={{
                                    fontWeight: 700, fontSize: 14, color: T.deep,
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                  }}>
                                    {c.title}
                                  </p>
                                  <p style={{ fontSize: 11.5, color: T.muted, fontWeight: 500, textTransform: "capitalize" }}>
                                    {c.category} · {c.issuer?.name || "Pending issuer"}
                                  </p>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
                                {c.status === "verified" && <TrustRing score={c.trustScore || 0} size={44} />}
                                <span style={{
                                  fontSize: 11, fontWeight: 800, padding: "4px 11px",
                                  borderRadius: 100, background: s.bg, color: s.color,
                                  border: `1px solid ${s.border}`, textTransform: "capitalize",
                                  whiteSpace: "nowrap",
                                }}>{c.status}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TiltCard>
            </FadeUp>

            {/* RIGHT — security + digilocker + quick actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Average trust score */}
              {counts.verified > 0 && (
                <FadeUp delay={120}>
                  <TiltCard>
                    <div style={{ padding: "22px 22px" }}>
                      <div style={{
                        height: 3, borderRadius: 100, marginBottom: 18,
                        background: "linear-gradient(90deg,#2dce7a,#0ea55e,transparent)"
                      }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <TrustRing score={avgTrust} size={72} />
                        <div>
                          <p style={{
                            fontSize: 11.5, fontWeight: 800, color: T.muted,
                            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4
                          }}>AVG TRUST SCORE</p>
                          <p style={{
                            fontWeight: 800, fontSize: 22, color: T.deep,
                            letterSpacing: "-0.025em", lineHeight: 1.1
                          }}>
                            {avgTrust >= 75 ? "High Trust" : avgTrust >= 50 ? "Medium Trust" : "Low Trust"}
                          </p>
                          <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                            Across {counts.verified} verified credential{counts.verified !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </FadeUp>
              )}

              {/* 2FA Security */}
              <FadeUp delay={140}>
                <TiltCard>
                  <div style={{ padding: "22px 22px" }}>
                    <div style={{
                      height: 3, borderRadius: 100, marginBottom: 18,
                      background: "linear-gradient(90deg,#3b82f6,#6366f1,transparent)"
                    }} />
                    <p style={{
                      fontSize: 11.5, fontWeight: 800, color: T.muted,
                      letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14
                    }}>SECURITY</p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 13,
                          background: user?.twoFactorEnabled
                            ? "rgba(45,206,122,0.12)" : "rgba(107,114,128,0.1)",
                          border: `1px solid ${user?.twoFactorEnabled ? "rgba(45,206,122,0.25)" : "rgba(107,114,128,0.2)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                        }}>🔐</div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: T.deep, marginBottom: 2 }}>
                            Two-Factor Auth
                          </p>
                          <p style={{
                            fontSize: 12, fontWeight: 600,
                            color: user?.twoFactorEnabled ? T.emerald : T.muted
                          }}>
                            {user?.twoFactorEnabled ? "✓ Enabled" : "Disabled"}
                          </p>
                        </div>
                      </div>

                      <button onClick={handle2FAToggle} disabled={toggling}
                        style={{
                          width: 52, height: 28, borderRadius: 100,
                          border: "none", cursor: toggling ? "not-allowed" : "pointer",
                          background: user?.twoFactorEnabled
                            ? "linear-gradient(135deg,#2dce7a,#0ea55e)"
                            : "rgba(107,114,128,0.2)",
                          position: "relative",
                          transition: "background 0.3s ease",
                          boxShadow: user?.twoFactorEnabled
                            ? "0 4px 12px rgba(45,206,122,0.35)"
                            : "none",
                          flexShrink: 0,
                        }}>
                        {toggling ? (
                          <div style={{
                            position: "absolute", inset: 0, display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}>
                            <div style={{
                              width: 14, height: 14, border: "2px solid rgba(255,255,255,0.5)",
                              borderTopColor: "white", borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }} />
                          </div>
                        ) : (
                          <div style={{
                            position: "absolute",
                            top: 3, left: user?.twoFactorEnabled ? 27 : 3,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "white",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                            transition: "left 0.28s cubic-bezier(.16,1,.3,1)",
                          }} />
                        )}
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>

              {/* DigiLocker */}
              <FadeUp delay={160}>
                <TiltCard>
                  <div style={{ padding: "22px 22px" }}>
                    <div style={{
                      height: 3, borderRadius: 100, marginBottom: 18,
                      background: "linear-gradient(90deg,#3b82f6,#6366f1,transparent)"
                    }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 13,
                          background: user?.digilockerLinked
                            ? "rgba(59,130,246,0.12)" : "rgba(107,114,128,0.1)",
                          border: `1px solid ${user?.digilockerLinked ? "rgba(59,130,246,0.25)" : "rgba(107,114,128,0.2)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                          position: "relative",
                        }}>
                          📱
                          {user?.digilockerLinked && (
                            <div style={{
                              position: "absolute", bottom: -2, right: -2,
                              width: 12, height: 12, borderRadius: "50%",
                              background: "#2dce7a", border: "2px solid white",
                              animation: "pulse-ring 2s infinite",
                            }} />
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: T.deep, marginBottom: 2 }}>DigiLocker Vault</p>
                          <p style={{
                            fontSize: 12, fontWeight: 600,
                            color: user?.digilockerLinked ? "#1d4ed8" : T.muted
                          }}>
                            {user?.digilockerLinked ? "✓ Linked & Active" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Link to="/digilocker" style={{
                        fontSize: 12.5, fontWeight: 700,
                        color: user?.digilockerLinked ? "#3b82f6" : T.emerald,
                        textDecoration: "none",
                        padding: "6px 14px", borderRadius: 100,
                        background: user?.digilockerLinked ? "rgba(59,130,246,0.1)" : "rgba(45,206,122,0.1)",
                        border: `1px solid ${user?.digilockerLinked ? "rgba(59,130,246,0.2)" : "rgba(45,206,122,0.2)"}`,
                        transition: "all 0.18s", whiteSpace: "nowrap",
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        {user?.digilockerLinked ? "Open →" : "Connect →"}
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>

              {/* Quick Actions */}
              <FadeUp delay={180}>
                <TiltCard>
                  <div style={{ padding: "22px 22px" }}>
                    <div style={{
                      height: 3, borderRadius: 100, marginBottom: 18,
                      background: "linear-gradient(90deg,#8b5cf6,#6366f1,transparent)"
                    }} />
                    <p style={{
                      fontSize: 11.5, fontWeight: 800, color: T.muted,
                      letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12
                    }}>QUICK ACTIONS</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <QuickRow to="/upload" emoji="⬆️" label="Upload New Credential" />
                      <QuickRow to="/wallet" emoji="👜" label="View Full Wallet" />
                      <QuickRow to="/ai-assistant" emoji="🤖" label="Ask AI Assistant" />
                      <QuickRow to="/verify" emoji="🔍" label="Verify a Credential" />
                      <QuickRow to="/radar" emoji="📡" label="Live Radar" />
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>
            </div>
          </div>

        </div>

        <style>{`
          @media (max-width:1100px) {
            .dash-main-grid { grid-template-columns:1fr !important; }
          }
          @media (max-width:900px) {
            .stats-responsive { grid-template-columns:repeat(2,1fr) !important; }
          }
          @media (max-width:640px) {
            .stats-responsive { grid-template-columns:1fr 1fr !important; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
