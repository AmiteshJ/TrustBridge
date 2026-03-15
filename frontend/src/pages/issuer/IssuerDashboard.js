/**
 * TrustBridge — Issuer Dashboard
 * Full blue design system: tilt cards · reputation ring · blue gradients
 * All functionality preserved: stats, reputation, quick actions
 */
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import { issuerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   BLUE DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const T = {
  white: "#ffffff",
  sky: "#eff6ff",
  mist: "#dbeafe",
  powder: "#bfdbfe",
  blue: "#3b82f6",
  royal: "#2563eb",
  navy: "#1d4ed8",
  deep: "#1e3a5f",
  ink: "#0f172a",
  muted: "#64748b",
  glass: "rgba(255,255,255,0.74)",
  glassBorder: "rgba(255,255,255,0.58)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE BACKGROUND — blue-white gradient
───────────────────────────────────────────────────────────────────────────── */
const PAGE_BG = "linear-gradient(170deg,#ffffff 0%,#f0f7ff 15%,#e0effe 35%,#c7e0ff 60%,#a3c8ff 85%,#60a5fa 100%)";

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
        borderRadius: 26, backdropFilter: "blur(20px)",
        transition: hov ? "transform 0.08s ease, box-shadow 0.08s ease"
          : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
        transform: hov
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.015)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "14px 20px 44px rgba(29,78,216,0.14), 0 4px 14px rgba(29,78,216,0.08)"
          : "6px 8px 24px rgba(29,78,216,0.09), 0 2px 6px rgba(29,78,216,0.05)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 26, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.2) 0%, transparent 60%)`
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────────────────────── */
function Counter({ end, suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let v = 0;
      const tick = () => {
        v += Math.ceil((end - v) / 8);
        if (v >= end) { setN(end); return; }
        setN(v); requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   REPUTATION RING
───────────────────────────────────────────────────────────────────────────── */
function ReputationRing({ score = 0, level = "medium" }) {
  const size = 96;
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = level === "high" ? "#22c55e" : level === "medium" ? "#f59e0b" : "#ef4444";
  const levelLabel = { high: "High Trust", medium: "Medium Trust", low: "Low Trust" }[level] || "Medium Trust";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(59,130,246,0.15)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{
          fontWeight: 800, fontSize: 20, color, lineHeight: 1,
          fontFamily: "'DM Sans',sans-serif"
        }}>{score}%</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, marginTop: 2 }}>SCORE</span>
      </div>
    </div>
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
   STAT CARD
───────────────────────────────────────────────────────────────────────────── */
function StatCard({ emoji, label, value, gradient, sub, to }) {
  const inner = (
    <TiltCard>
      <div style={{ padding: "22px 20px" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 14
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 16, flexShrink: 0,
            background: gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 14px rgba(29,78,216,0.18)",
          }}>{emoji}</div>
          {to && (
            <div style={{
              width: 28, height: 28, borderRadius: 10,
              background: "rgba(59,130,246,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: T.blue, fontWeight: 800
            }}>→</div>
          )}
        </div>
        <p style={{
          fontWeight: 800, fontSize: 32, color: T.deep,
          letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 5,
          fontFamily: "'DM Sans',sans-serif"
        }}>
          {typeof value === "number"
            ? <Counter end={value} />
            : (value ?? "—")}
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>{label}</p>
        {sub && <p style={{ fontSize: 11.5, color: "rgba(100,116,139,0.7)", marginTop: 2 }}>{sub}</p>}
      </div>
    </TiltCard>
  );

  return to
    ? <Link to={to} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
    : inner;
}

/* ─────────────────────────────────────────────────────────────────────────────
   QUICK ACTION ROW
───────────────────────────────────────────────────────────────────────────── */
function QuickRow({ to, emoji, label, sub }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} style={{ textDecoration: "none" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 16px", borderRadius: 16,
        background: hov ? "rgba(59,130,246,0.08)" : "transparent",
        transition: "all 0.18s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
            background: hov ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            transition: "all 0.18s",
          }}>{emoji}</div>
          <div>
            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14,
              color: hov ? T.navy : T.deep
            }}>{label}</p>
            {sub && <p style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</p>}
          </div>
        </div>
        <span style={{
          fontSize: 15, color: hov ? T.blue : "rgba(100,116,139,0.35)",
          fontWeight: 800, transition: "all 0.18s",
          transform: hov ? "translateX(3px)" : "translateX(0)",
          display: "inline-block",
        }}>→</span>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function IssuerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuerAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const trustColor = {
    high: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#15803d" },
    medium: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#92400e" },
    low: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", color: "#991b1b" },
  };
  const tc = trustColor[stats?.trustLevel] || trustColor.medium;

  return (
    <DashboardLayout>
      {/* Inject blue background override for issuer */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes shimmer2 { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        .shimmer-text-blue {
          background:linear-gradient(90deg,#1d4ed8 0%,#3b82f6 30%,#93c5fd 50%,#3b82f6 70%,#1d4ed8 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .skel { background:linear-gradient(90deg,rgba(219,234,254,0.7) 25%,rgba(191,219,254,0.6) 50%,rgba(219,234,254,0.7) 75%);
          background-size:200% 100%; animation:shimmer2 1.4s infinite; border-radius:22px; }
        .fa1 { animation:fadeUp 0.6s cubic-bezier(.16,1,.3,1) both; }
        .fa2 { animation:fadeUp 0.6s 0.08s cubic-bezier(.16,1,.3,1) both; }
        .fa3 { animation:fadeUp 0.6s 0.16s cubic-bezier(.16,1,.3,1) both; }
        .fa4 { animation:fadeUp 0.6s 0.24s cubic-bezier(.16,1,.3,1) both; }

        @media (max-width:900px) {
          .issuer-main-grid { grid-template-columns:1fr !important; }
          .issuer-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
        }
        @media (max-width:560px) {
          .issuer-stats-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>

        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        <div className="fa1" style={{
          borderRadius: 26, padding: "28px 36px", marginBottom: 24,
          background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 45%,#3b82f6 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden",
          boxShadow: "0 16px 48px rgba(29,78,216,0.3)",
        }}>
          {/* Decorative rings */}
          <div style={{
            position: "absolute", top: -50, right: -50, width: 220, height: 220,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -25, right: -25, width: 140, height: 140,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.16)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", bottom: -60, left: -40, width: 240, height: 240,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "42%",
            fontSize: 110, opacity: 0.04, color: "white",
            transform: "translateY(-50%)", userSelect: "none", fontWeight: 800
          }}>✦</div>

          <div>
            <p style={{
              fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8
            }}>ISSUER DASHBOARD</p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(20px,2.5vw,32px)", color: "white",
              letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4
            }}>
              Welcome back,{" "}
              <span style={{ color: "rgba(191,219,254,0.95)" }}>
                {user?.organization || user?.name?.split(" ")[0]}
              </span>
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>
              Manage credential verification, issuance, and your institution's reputation.
            </p>
          </div>

          {/* Reputation pill in banner */}
          {stats && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", borderRadius: 100,
              background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
            }}>
              <span style={{ fontSize: 20 }}>⭐</span>
              <div>
                <p style={{
                  fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.08em", textTransform: "uppercase"
                }}>Reputation</p>
                <p style={{
                  fontWeight: 800, fontSize: 18, color: "white",
                  letterSpacing: "-0.02em"
                }}>{stats.reputationScore}%</p>
              </div>
            </div>
          )}
        </div>

        {/* ── STATS GRID ───────────────────────────────────────────────── */}
        <FadeUp delay={60}>
          <div className="issuer-stats-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22,
          }}>
            <StatCard
              emoji="⏳" label="Pending Review" sub="Awaiting your decision"
              value={loading ? null : (stats?.pending ?? 0)}
              gradient="linear-gradient(135deg,rgba(245,158,11,0.9),rgba(251,146,60,0.9))"
              to="/issuer/queue"
            />
            <StatCard
              emoji="✅" label="Credentials Issued" sub="Successfully verified"
              value={loading ? null : (stats?.issued ?? 0)}
              gradient="linear-gradient(135deg,rgba(59,130,246,0.9),rgba(37,99,235,0.9))"
              to="/issuer/history"
            />
            <StatCard
              emoji="🚫" label="Revoked" sub="Credentials revoked"
              value={loading ? null : (stats?.revoked ?? 0)}
              gradient="linear-gradient(135deg,rgba(239,68,68,0.9),rgba(220,38,38,0.9))"
              to="/issuer/history"
            />
          </div>
        </FadeUp>

        {/* Skeleton while loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22 }}>
            {[1, 2, 3].map(i => <div key={i} className="skel" style={{ height: 120 }} />)}
          </div>
        )}

        {/* ── MAIN GRID ──────────────────────────────────────────────── */}
        <div className="issuer-main-grid" style={{
          display: "grid", gridTemplateColumns: "1fr 340px", gap: 20,
        }}>

          {/* LEFT — Reputation + quick actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Reputation card */}
            {stats && (
              <FadeUp delay={100}>
                <TiltCard>
                  <div style={{ padding: "26px 28px" }}>
                    <div style={{
                      height: 3, borderRadius: 100, marginBottom: 22,
                      background: "linear-gradient(90deg,#3b82f6,#1d4ed8,transparent)"
                    }} />

                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", flexWrap: "wrap", gap: 20
                    }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <p style={{
                          fontSize: 11, fontWeight: 800, color: T.muted,
                          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8
                        }}>
                          ISSUER REPUTATION
                        </p>
                        <h2 style={{
                          fontWeight: 800, fontSize: 22, color: T.deep,
                          letterSpacing: "-0.025em", marginBottom: 8
                        }}>
                          {stats.trustLevel === "high" ? "Trusted Institution" :
                            stats.trustLevel === "medium" ? "Building Trust" : "Needs Improvement"}
                        </h2>
                        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 16 }}>
                          Your reputation is based on issuance quality, verification accuracy,
                          and revocation history.
                        </p>

                        {/* Trust level badge */}
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 800,
                          background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                          textTransform: "capitalize",
                        }}>
                          {stats.trustLevel === "high" ? "⭐" :
                            stats.trustLevel === "medium" ? "📈" : "⚠️"} {stats.trustLevel} trust
                        </span>
                      </div>

                      {/* Ring */}
                      <ReputationRing score={stats.reputationScore} level={stats.trustLevel} />
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Reputation Progress</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: T.navy }}>{stats.reputationScore}%</span>
                      </div>
                      <div style={{
                        height: 8, borderRadius: 100,
                        background: "rgba(59,130,246,0.12)", overflow: "hidden"
                      }}>
                        <div style={{
                          height: "100%", width: `${stats.reputationScore}%`, borderRadius: 100,
                          background: "linear-gradient(90deg,#3b82f6,#1d4ed8)",
                          boxShadow: "0 0 12px rgba(59,130,246,0.4)",
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>
            )}

            {/* Quick actions */}
            <FadeUp delay={140}>
              <TiltCard>
                <div style={{ padding: "24px 22px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 18,
                    background: "linear-gradient(90deg,#3b82f6,#1d4ed8,transparent)"
                  }} />
                  <p style={{
                    fontSize: 11, fontWeight: 800, color: T.muted,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12
                  }}>
                    QUICK ACTIONS
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <QuickRow to="/issuer/queue" emoji="📋"
                      label="Verification Queue"
                      sub="Review pending credential requests" />
                    <QuickRow to="/issuer/history" emoji="🕑"
                      label="Issued History"
                      sub="View all credentials you've issued" />
                    <QuickRow to="/radar" emoji="📡"
                      label="Live Radar"
                      sub="Monitor ecosystem activity" />
                  </div>
                </div>
              </TiltCard>
            </FadeUp>
          </div>

          {/* RIGHT — institution info + stats summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Institution card */}
            <FadeUp delay={120}>
              <TiltCard>
                <div style={{ padding: "24px 22px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 18,
                    background: "linear-gradient(90deg,#3b82f6,#1d4ed8,transparent)"
                  }} />
                  <p style={{
                    fontSize: 11, fontWeight: 800, color: T.muted,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14
                  }}>
                    INSTITUTION
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                      background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24, boxShadow: "0 6px 18px rgba(59,130,246,0.3)",
                    }}>🏛️</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontWeight: 800, fontSize: 15, color: T.deep,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3
                      }}>
                        {user?.organization || user?.name || "Institution"}
                      </p>
                      <p style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats pills */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Issued", value: stats?.issued ?? "—", color: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: T.navy },
                      { label: "Pending", value: stats?.pending ?? "—", color: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", text: "#92400e" },
                      { label: "Revoked", value: stats?.revoked ?? "—", color: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.18)", text: "#991b1b" },
                      {
                        label: "Score", value: stats ? `${stats.reputationScore}%` : "—",
                        color: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#15803d"
                      },
                    ].map(({ label, value, color, border, text }) => (
                      <div key={label} style={{
                        background: color, borderRadius: 14,
                        padding: "10px 12px", border: `1px solid ${border}`,
                      }}>
                        <p style={{
                          fontSize: 10.5, fontWeight: 700, color: T.muted,
                          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3
                        }}>{label}</p>
                        <p style={{ fontSize: 17, fontWeight: 800, color: text }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </FadeUp>

            {/* Tip card */}
            <FadeUp delay={180}>
              <div style={{
                padding: "18px 20px", borderRadius: 22,
                background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)",
                position: "relative", overflow: "hidden",
                boxShadow: "0 8px 28px rgba(29,78,216,0.25)",
              }}>
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 100, height: 100,
                  borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none"
                }} />
                <p style={{
                  fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8
                }}>PRO TIP</p>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.6, fontWeight: 400 }}>
                  Review pending credentials promptly to maintain a high reputation score and build institutional trust.
                </p>
                <Link to="/issuer/queue" style={{
                  display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
                  padding: "8px 18px", borderRadius: 100,
                  background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
                  fontSize: 13, fontWeight: 700, color: "white", textDecoration: "none",
                  transition: "background 0.18s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}>
                  Review Queue →
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
