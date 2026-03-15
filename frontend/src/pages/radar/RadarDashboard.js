/**
 * TrustBridge — Live Credential Radar Dashboard
 * Real-time ecosystem activity · Chart.js · Socket.io
 * Same design DNA: morphing orbs · tilt cards · magnetic buttons
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { radarAPI } from "../../services/api";
import { io } from "socket.io-client";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const T = {
  white:       "#ffffff",
  snow:        "#f7fdf9",
  mist:        "#edfaf3",
  foam:        "#d4f5e2",
  mint:        "#a8edca",
  jade:        "#2dce7a",
  emerald:     "#0ea55e",
  forest:      "#076b3c",
  deep:        "#043d22",
  muted:       "#5a7d6a",
  glass:       "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.55)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   MORPHING ORBS
───────────────────────────────────────────────────────────────────────────── */
function MorphOrbs() {
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <div style={{
        position:"absolute", top:"-15%", right:"-10%",
        width:"65vw", height:"65vw", borderRadius:"50%",
        background:"radial-gradient(ellipse at 40% 40%, #a8edca 0%, #2dce7a22 45%, transparent 70%)",
        animation:"orb1 12s ease-in-out infinite", filter:"blur(1px)",
      }} />
      <div style={{
        position:"absolute", bottom:"-20%", left:"-15%",
        width:"55vw", height:"55vw", borderRadius:"50%",
        background:"radial-gradient(ellipse at 60% 60%, #d4f5e2 0%, #0ea55e18 50%, transparent 70%)",
        animation:"orb2 16s ease-in-out infinite", filter:"blur(2px)",
      }} />
      <div style={{
        position:"absolute", top:"35%", left:"30%",
        width:"40vw", height:"40vw", borderRadius:"50%",
        background:"radial-gradient(ellipse at 50% 50%, #ffffff55 0%, #a8edca11 60%, transparent 75%)",
        animation:"orb3 20s ease-in-out infinite",
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TILT CARD
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, style: extra = {}, noHover = false }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx:0, ry:0, sx:50, sy:50 });
  const [hov,  setHov]  = useState(false);

  const onMove = (e) => {
    if (noHover) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    setTilt({ rx:(y-0.5)*-8, ry:(x-0.5)*8, sx:x*100, sy:y*100 });
  };

  return (
    <div ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => !noHover && setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ rx:0, ry:0, sx:50, sy:50 }); }}
      style={{
        position:"relative", overflow:"hidden",
        background:T.glass, border:`1.5px solid ${T.glassBorder}`,
        borderRadius:28, backdropFilter:"blur(20px)",
        transition: hov
          ? "transform 0.08s ease, box-shadow 0.08s ease"
          : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
        transform: hov
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.015)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "16px 24px 48px rgba(7,107,60,0.16), 0 4px 16px rgba(7,107,60,0.08)"
          : "6px 10px 28px rgba(7,107,60,0.09), 0 2px 6px rgba(7,107,60,0.05)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position:"absolute", inset:0, borderRadius:28, pointerEvents:"none", zIndex:2,
          background:`radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.16) 0%, transparent 58%)`,
        }} />
      )}
      <div style={{ position:"relative", zIndex:3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────────────────────── */
function Counter({ value }) {
  const [display, setDisplay] = useState(value ?? 0);
  const prev = useRef(value);

  useEffect(() => {
    if (value === null || value === undefined) return;
    const from = prev.current ?? 0;
    const to   = value;
    if (from === to) return;
    prev.current = to;
    let start = null;
    const dur = 600;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span>{display?.toLocaleString() ?? "—"}</span>;
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
    }, { threshold:0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition:`opacity 0.7s ${delay}ms cubic-bezier(.16,1,.3,1), transform 0.7s ${delay}ms cubic-bezier(.16,1,.3,1)`,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ACTIVITY CONFIG
───────────────────────────────────────────────────────────────────────────── */
const ACT = {
  credential_requested: { emoji:"📤", label:"Requested",  bg:"rgba(59,130,246,0.1)",  color:"#1d4ed8" },
  credential_issued:    { emoji:"✅", label:"Issued",     bg:"rgba(45,206,122,0.1)",  color:"#076b3c" },
  credential_verified:  { emoji:"🔍", label:"Verified",   bg:"rgba(20,184,166,0.1)",  color:"#0f766e" },
  credential_revoked:   { emoji:"🚫", label:"Revoked",    bg:"rgba(245,158,11,0.1)",  color:"#92400e" },
  fraud_detected:       { emoji:"🚨", label:"Fraud",      bg:"rgba(239,68,68,0.12)",  color:"#991b1b" },
  user_registered:      { emoji:"👤", label:"Registered", bg:"rgba(139,92,246,0.1)",  color:"#5b21b6" },
  digilocker_synced:    { emoji:"📱", label:"DigiLocker", bg:"rgba(99,102,241,0.1)",  color:"#3730a3" },
};

const getAct = (type) => ACT[type] || { emoji:"📋", label:type, bg:"rgba(107,114,128,0.1)", color:"#374151" };

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────────────────── */
function StatCard({ emoji, label, value, gradient, sub }) {
  return (
    <TiltCard>
      <div style={{ padding:"22px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{
            width:44, height:44, borderRadius:14, flexShrink:0,
            background:gradient,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20,
            boxShadow:"0 4px 14px rgba(7,107,60,0.15)",
          }}>{emoji}</div>
          <p style={{ fontSize:13, fontWeight:600, color:T.muted, lineHeight:1.3 }}>{label}</p>
        </div>
        <p style={{
          fontWeight:800, fontSize:34, color:T.deep,
          letterSpacing:"-0.04em", lineHeight:1, marginBottom:4,
          fontFamily:"'DM Sans',sans-serif",
        }}>
          <Counter value={value} />
        </p>
        {sub && <p style={{ fontSize:12, color:T.muted, fontWeight:500 }}>{sub}</p>}
      </div>
    </TiltCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function RadarDashboard() {
  const [stats,       setStats]       = useState(null);
  const [activity,    setActivity]    = useState([]);
  const [trends,      setTrends]      = useState([]);
  const [issuers,     setIssuers]     = useState([]);
  const [timeline,    setTimeline]    = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [liveCount,   setLiveCount]   = useState(0);
  const [scrollY,     setScrollY]     = useState(0);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const socketRef = useRef(null);
  const feedRef   = useRef(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Fetch all data ─────────────────────────────────────────────────── */
  useEffect(() => {
    Promise.allSettled([
      radarAPI.getLiveActivity(30),
      radarAPI.getDashboardStats(),
      radarAPI.getCategoryTrends(),
      radarAPI.getTopIssuers(),
      radarAPI.getActivityTimeline(),
      radarAPI.getFraudAlerts(),
    ]).then(([a, s, tr, iss, tl, fa]) => {
      if (a.status   === "fulfilled") setActivity(a.value.data.activities    || []);
      if (s.status   === "fulfilled") setStats(s.value.data.stats);
      if (tr.status  === "fulfilled") setTrends(tr.value.data.trends         || []);
      if (iss.status === "fulfilled") setIssuers(iss.value.data.issuers      || []);
      if (tl.status  === "fulfilled") setTimeline(tl.value.data.timeline     || []);
      if (fa.status  === "fulfilled") setFraudAlerts(fa.value.data.alerts    || []);
    });

    /* Socket.io real-time */
    const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000");
    socketRef.current = socket;
    socket.emit("join:radar");
    socket.on("activity:new", (evt) => {
      setActivity(prev => [evt, ...prev].slice(0, 30));
      setLiveCount(c => c + 1);
      setStats(prev => prev ? { ...prev, totalCredentials: (prev.totalCredentials || 0) + 1 } : prev);
      /* scroll feed to top */
      if (feedRef.current) feedRef.current.scrollTop = 0;
    });
    return () => socket.disconnect();
  }, []);

  const navGlass = scrollY > 30;

  /* ── Chart data ─────────────────────────────────────────────────────── */
  const CHART_COLORS = ["#2dce7a","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#ec4899"];

  const donutData = {
    labels: trends.map(t => t._id || "other"),
    datasets: [{
      data: trends.map(t => t.count),
      backgroundColor: CHART_COLORS.slice(0, trends.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const days        = [...new Set(timeline.map(t => t._id?.date))].sort();
  const issuedSeries = days.map(d => timeline.find(t => t._id?.date === d && t._id?.type === "credential_issued")?.count  || 0);
  const verifSeries  = days.map(d => timeline.find(t => t._id?.date === d && t._id?.type === "credential_verified")?.count || 0);

  const lineData = {
    labels: days.map(d => new Date(d).toLocaleDateString("en", { month:"short", day:"numeric" })),
    datasets: [
      {
        label:"Issued",
        data: issuedSeries,
        borderColor:"#2dce7a",
        backgroundColor:"rgba(45,206,122,0.08)",
        fill:true, tension:0.45,
        pointRadius:5, pointBackgroundColor:"#2dce7a",
        pointBorderColor:"white", pointBorderWidth:2,
        borderWidth:2.5,
      },
      {
        label:"Verified",
        data: verifSeries,
        borderColor:"#3b82f6",
        backgroundColor:"rgba(59,130,246,0.06)",
        fill:true, tension:0.45,
        pointRadius:5, pointBackgroundColor:"#3b82f6",
        pointBorderColor:"white", pointBorderWidth:2,
        borderWidth:2.5,
      },
    ],
  };

  const lineOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{ position:"bottom", labels:{ usePointStyle:true, pointStyle:"circle", padding:20, font:{ family:"DM Sans", size:12, weight:"600" }, color:"#5a7d6a" }},
      tooltip:{ backgroundColor:"rgba(4,62,34,0.92)", titleFont:{ family:"DM Sans", weight:"700" }, bodyFont:{ family:"DM Sans" }, padding:12, cornerRadius:12, borderColor:"rgba(45,206,122,0.3)", borderWidth:1 },
    },
    scales:{
      x:{ grid:{ color:"rgba(45,206,122,0.08)" }, ticks:{ font:{ family:"DM Sans", size:11 }, color:"#5a7d6a" }},
      y:{ beginAtZero:true, grid:{ color:"rgba(45,206,122,0.08)" }, ticks:{ font:{ family:"DM Sans", size:11 }, color:"#5a7d6a" }},
    },
  };

  const donutOpts = {
    responsive:true, maintainAspectRatio:false,
    cutout:"68%",
    plugins:{
      legend:{ position:"bottom", labels:{ usePointStyle:true, pointStyle:"circle", padding:16, font:{ family:"DM Sans", size:12, weight:"600" }, color:"#5a7d6a" }},
      tooltip:{ backgroundColor:"rgba(4,62,34,0.92)", titleFont:{ family:"DM Sans", weight:"700" }, bodyFont:{ family:"DM Sans" }, padding:12, cornerRadius:12 },
    },
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(170deg,#ffffff 0%,#f7fdf9 12%,#edfaf3 28%,#d4f5e2 55%,#a8edca 80%,#4dd99a 100%)",
      fontFamily:"'DM Sans',system-ui,sans-serif",
      position:"relative",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-3%,4%) scale(1.06)} 66%{transform:translate(3%,-2%) scale(0.96)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(4%,-3%) scale(1.08)} 70%{transform:translate(-2%,5%) scale(0.94)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-5%,3%)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(45,206,122,0.5)} 70%{box-shadow:0 0 0 12px rgba(45,206,122,0)} 100%{box-shadow:0 0 0 0 rgba(45,206,122,0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .shimmer-text {
          background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .nav-link { padding:8px 16px; border-radius:100px; font-weight:600; font-size:14px; color:#3d6b52; text-decoration:none; transition:all 0.18s; }
        .nav-link:hover { background:rgba(45,206,122,0.12); color:#076b3c; }

        .activity-item { animation:slideInLeft 0.35s cubic-bezier(.16,1,.3,1) both; }

        .issuer-row { transition:background 0.18s; border-radius:14px; padding:10px 14px; }
        .issuer-row:hover { background:rgba(45,206,122,0.07); }

        .fraud-row { transition:all 0.18s; border-radius:14px; padding:11px 14px; }
        .fraud-row:hover { background:rgba(239,68,68,0.08); }

        .live-dot { animation:blink-dot 1.5s ease-in-out infinite; }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(45,206,122,0.3); border-radius:99px; }

        @media (max-width:768px) {
          .desktop-nav { display:none !important; }
          .mobile-btn  { display:flex !important; }
          .stats-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .main-grid   { grid-template-columns:1fr !important; }
          .bottom-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <MorphOrbs />

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header style={{
        position:"sticky", top:0, zIndex:999,
        transition:"all 0.35s ease",
        background: navGlass ? "rgba(247,253,249,0.9)" : "rgba(247,253,249,0.7)",
        backdropFilter:"blur(24px) saturate(180%)",
        borderBottom:"1px solid rgba(45,206,122,0.14)",
        boxShadow: navGlass ? "0 2px 32px rgba(7,107,60,0.07)" : "none",
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px",
          height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          <Link to="/" style={{ display:"flex", alignItems:"center", gap:11, textDecoration:"none" }}>
            <div style={{
              width:38, height:38, borderRadius:12,
              background:"linear-gradient(145deg,#2dce7a,#076b3c)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, color:"white", fontWeight:800,
              boxShadow:"0 6px 16px rgba(45,206,122,0.3)",
            }}>✦</div>
            <div>
              <p style={{ fontWeight:800, fontSize:17, color:T.deep, lineHeight:1.1, letterSpacing:"-0.02em" }}>TrustBridge</p>
              <p style={{ fontSize:9.5, fontWeight:700, color:T.emerald, letterSpacing:"0.1em" }}>CREDENTIAL PLATFORM</p>
            </div>
          </Link>

          {/* Live indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:8,
            padding:"7px 18px", borderRadius:100,
            background:"rgba(255,255,255,0.75)", border:"1.5px solid rgba(45,206,122,0.25)",
            backdropFilter:"blur(10px)",
          }}>
            <span className="live-dot" style={{
              width:8, height:8, borderRadius:"50%", background:"#2dce7a",
              display:"inline-block", flexShrink:0,
              boxShadow:"0 0 0 3px rgba(45,206,122,0.2)",
            }} />
            <span style={{ fontSize:12.5, fontWeight:700, color:T.forest, letterSpacing:"0.04em" }}>
              LIVE RADAR
            </span>
            {liveCount > 0 && (
              <span style={{
                fontSize:11, fontWeight:800, color:"white",
                background:"linear-gradient(135deg,#2dce7a,#0ea55e)",
                padding:"2px 8px", borderRadius:100,
                animation:"fadeUp 0.3s ease both",
              }}>+{liveCount}</span>
            )}
          </div>

          <nav className="desktop-nav" style={{ display:"flex", alignItems:"center", gap:4 }}>
            {[["Home","/"],["Verify","/verify"],["Login","/login"],["Sign Up","/register"]].map(([l,to]) => (
              <Link key={to} to={to} className="nav-link">{l}</Link>
            ))}
          </nav>

          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display:"none", background:"none", border:"none", cursor:"pointer",
              width:40, height:40, alignItems:"center", justifyContent:"center",
              borderRadius:10, color:T.forest, fontSize:22 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div style={{ background:"rgba(247,253,249,0.98)", backdropFilter:"blur(20px)",
            borderTop:"1px solid rgba(45,206,122,0.12)", padding:"12px 32px 20px" }}>
            {[["Home","/"],["Verify","/verify"],["Login","/login"],["Sign Up","/register"]].map(([l,to]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                style={{ display:"block", padding:"11px 0", fontWeight:600, fontSize:15,
                  color:T.forest, textDecoration:"none", borderBottom:"1px solid rgba(45,206,122,0.1)" }}>{l}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto", padding:"40px 32px 80px" }}>

        {/* ── HERO HEADER ──────────────────────────────────────────────── */}
        <div style={{ marginBottom:44 }}>
          <p style={{ fontSize:12, fontWeight:800, color:T.emerald, letterSpacing:"0.14em",
            textTransform:"uppercase", marginBottom:12 }}>ECOSYSTEM OVERVIEW</p>
          <h1 style={{ fontWeight:800, fontSize:"clamp(32px,4vw,56px)", color:T.deep,
            letterSpacing:"-0.035em", lineHeight:1.08, marginBottom:12 }}>
            Live Credential{" "}
            <span className="shimmer-text">Radar.</span>
          </h1>
          <p style={{ fontSize:16, color:T.muted, fontWeight:400, lineHeight:1.6, maxWidth:520 }}>
            Real-time issuance, verification, and fraud activity across the TrustBridge ecosystem.
            Updates live via WebSocket.
          </p>
        </div>

        {/* ── STATS GRID ───────────────────────────────────────────────── */}
        <FadeUp>
          <div className="stats-grid" style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:32,
          }}>
            <StatCard emoji="📋" label="Total Credentials"   value={stats?.totalCredentials}   gradient="linear-gradient(135deg,rgba(212,245,226,0.9),rgba(168,237,202,0.7))" sub={`${stats?.verifiedCredentials || 0} verified`} />
            <StatCard emoji="✅" label="Verified"            value={stats?.verifiedCredentials} gradient="linear-gradient(135deg,rgba(187,247,208,0.9),rgba(134,239,172,0.7))" sub="authentic credentials" />
            <StatCard emoji="🔍" label="Total Verifications" value={stats?.totalVerifications}  gradient="linear-gradient(135deg,rgba(219,234,254,0.9),rgba(191,219,254,0.7))" sub="by verifiers" />
            <StatCard emoji="🚨" label="Fraud Detected"      value={stats?.fraudCount}          gradient="linear-gradient(135deg,rgba(254,226,226,0.9),rgba(252,165,165,0.7))" sub="tamper attempts" />
            <StatCard emoji="⏳" label="Pending Review"      value={stats?.pendingCredentials}  gradient="linear-gradient(135deg,rgba(254,243,199,0.9),rgba(253,230,138,0.7))" sub="awaiting issuers" />
            <StatCard emoji="🚫" label="Revoked"             value={stats?.revokedCredentials}  gradient="linear-gradient(135deg,rgba(243,232,255,0.9),rgba(233,213,255,0.7))" sub="by issuers" />
            <StatCard emoji="👤" label="Users"               value={stats?.totalUsers}          gradient="linear-gradient(135deg,rgba(224,242,254,0.9),rgba(186,230,253,0.7))" sub="registered" />
            <StatCard emoji="🏛️" label="Issuers"             value={stats?.totalIssuers}        gradient="linear-gradient(135deg,rgba(240,253,244,0.9),rgba(209,250,229,0.7))" sub="active institutions" />
          </div>
        </FadeUp>

        {/* ── MAIN GRID: Activity Feed + Timeline ──────────────────────── */}
        <div className="main-grid" style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:22, marginBottom:22 }}>

          {/* Live Activity Feed */}
          <FadeUp delay={60}>
            <TiltCard style={{ height:480 }}>
              <div style={{ padding:"24px 24px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span className="live-dot" style={{
                      width:7, height:7, borderRadius:"50%", background:"#2dce7a",
                      display:"inline-block", boxShadow:"0 0 0 3px rgba(45,206,122,0.2)",
                    }} />
                    <h2 style={{ fontWeight:800, fontSize:16, color:T.deep, letterSpacing:"-0.02em" }}>
                      Live Activity Feed
                    </h2>
                  </div>
                  <p style={{ fontSize:12, color:T.muted, fontWeight:500 }}>
                    {activity.length} events loaded
                  </p>
                </div>
                <div style={{
                  padding:"4px 12px", borderRadius:100,
                  background:"rgba(212,245,226,0.6)", border:"1px solid rgba(45,206,122,0.25)",
                  fontSize:11, fontWeight:800, color:T.forest,
                }}>LIVE</div>
              </div>

              {/* Top gradient accent */}
              <div style={{ height:3, margin:"16px 24px 0",
                background:"linear-gradient(90deg,#2dce7a,#0ea55e,transparent)",
                borderRadius:100 }} />

              <div ref={feedRef} style={{
                overflowY:"auto", height:360, padding:"12px 14px",
              }}>
                {activity.length === 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                    justifyContent:"center", height:"100%", gap:10 }}>
                    <span style={{ fontSize:32 }}>📡</span>
                    <p style={{ fontSize:13, color:T.muted, fontWeight:500 }}>Waiting for activity…</p>
                  </div>
                ) : activity.map((a, i) => {
                  const cfg = getAct(a.activityType);
                  return (
                    <div key={a._id || i} className="activity-item"
                      style={{
                        display:"flex", alignItems:"flex-start", gap:10,
                        padding:"10px 12px", borderRadius:16, marginBottom:6,
                        background:cfg.bg, border:`1px solid ${cfg.color}18`,
                        animationDelay:`${i === 0 ? 0 : 0}ms`,
                      }}>
                      <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{cfg.emoji}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:T.deep,
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2 }}>
                          {a.credentialTitle || a.activityType.replace(/_/g," ")}
                        </p>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <p style={{ fontSize:11.5, color:T.muted, fontWeight:500 }}>
                            {a.actorName || "System"}
                          </p>
                          <p style={{ fontSize:11, color:T.muted, flexShrink:0, marginLeft:8 }}>
                            {new Date(a.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TiltCard>
          </FadeUp>

          {/* 7-Day Timeline */}
          <FadeUp delay={100}>
            <TiltCard style={{ height:480 }}>
              <div style={{ padding:"24px 28px 20px" }}>
                <h2 style={{ fontWeight:800, fontSize:16, color:T.deep,
                  letterSpacing:"-0.02em", marginBottom:4 }}>7-Day Activity Timeline</h2>
                <p style={{ fontSize:12, color:T.muted, fontWeight:500, marginBottom:20 }}>
                  Credential issuance vs verifications over the past week
                </p>
                <div style={{ height:360 }}>
                  {days.length > 0
                    ? <Line data={lineData} options={lineOpts} />
                    : (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                        justifyContent:"center", height:"100%", gap:10 }}>
                        <span style={{ fontSize:32 }}>📈</span>
                        <p style={{ fontSize:13, color:T.muted, fontWeight:500 }}>No timeline data yet</p>
                      </div>
                    )
                  }
                </div>
              </div>
            </TiltCard>
          </FadeUp>
        </div>

        {/* ── BOTTOM GRID: Donut + Top Issuers + Fraud ─────────────────── */}
        <div className="bottom-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:22 }}>

          {/* Category Donut */}
          <FadeUp delay={120}>
            <TiltCard>
              <div style={{ padding:"24px 24px 20px" }}>
                <h2 style={{ fontWeight:800, fontSize:16, color:T.deep,
                  letterSpacing:"-0.02em", marginBottom:4 }}>Credential Categories</h2>
                <p style={{ fontSize:12, color:T.muted, fontWeight:500, marginBottom:16 }}>
                  Distribution by type
                </p>
                <div style={{ height:240 }}>
                  {trends.length > 0
                    ? <Doughnut data={donutData} options={donutOpts} />
                    : (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                        justifyContent:"center", height:"100%", gap:10 }}>
                        <span style={{ fontSize:32 }}>🍩</span>
                        <p style={{ fontSize:13, color:T.muted }}>No category data yet</p>
                      </div>
                    )
                  }
                </div>
              </div>
            </TiltCard>
          </FadeUp>

          {/* Top Issuers */}
          <FadeUp delay={150}>
            <TiltCard>
              <div style={{ padding:"24px 20px" }}>
                <h2 style={{ fontWeight:800, fontSize:16, color:T.deep,
                  letterSpacing:"-0.02em", marginBottom:4 }}>Top Issuers</h2>
                <p style={{ fontSize:12, color:T.muted, fontWeight:500, marginBottom:16 }}>
                  Ranked by reputation score
                </p>

                {issuers.length === 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                    paddingTop:40, gap:10 }}>
                    <span style={{ fontSize:32 }}>🏛️</span>
                    <p style={{ fontSize:13, color:T.muted }}>No issuers yet</p>
                  </div>
                ) : issuers.slice(0, 6).map((iss, i) => {
                  const score = iss.issuerProfile?.reputationScore || 0;
                  const level = score >= 80 ? "high" : score >= 50 ? "medium" : "low";
                  const levelColor = { high:"#0ea55e", medium:"#f59e0b", low:"#ef4444" }[level];
                  const levelBg    = { high:"rgba(45,206,122,0.1)", medium:"rgba(245,158,11,0.1)", low:"rgba(239,68,68,0.1)" }[level];

                  return (
                    <div key={iss._id} className="issuer-row"
                      style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <span style={{
                        width:24, height:24, borderRadius:"50%", flexShrink:0,
                        background:"linear-gradient(135deg,#2dce7a,#0ea55e)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, fontWeight:800, color:"white",
                      }}>{i + 1}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:T.deep,
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {iss.organization || iss.name}
                        </p>
                        <p style={{ fontSize:11, color:T.muted }}>
                          {iss.issuerProfile?.totalIssued || 0} issued
                        </p>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <p style={{ fontSize:14, fontWeight:800, color:T.forest }}>{score}%</p>
                        <span style={{
                          fontSize:10, fontWeight:700, padding:"2px 8px",
                          borderRadius:100, background:levelBg, color:levelColor,
                          textTransform:"capitalize",
                        }}>{level}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TiltCard>
          </FadeUp>

          {/* Fraud Alerts */}
          <FadeUp delay={180}>
            <TiltCard>
              <div style={{ padding:"24px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:16 }}>🚨</span>
                  <h2 style={{ fontWeight:800, fontSize:16, color:T.deep, letterSpacing:"-0.02em" }}>
                    Fraud Alerts
                  </h2>
                </div>
                <p style={{ fontSize:12, color:T.muted, fontWeight:500, marginBottom:16 }}>
                  Recent tamper detections
                </p>

                {fraudAlerts.length === 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                    paddingTop:40, gap:12 }}>
                    <div style={{
                      width:52, height:52, borderRadius:18,
                      background:"rgba(212,245,226,0.6)", border:"1.5px solid rgba(45,206,122,0.2)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
                    }}>✅</div>
                    <p style={{ fontSize:13, fontWeight:700, color:T.forest }}>All clear</p>
                    <p style={{ fontSize:12, color:T.muted, textAlign:"center" }}>
                      No fraud detected in the ecosystem
                    </p>
                  </div>
                ) : fraudAlerts.slice(0, 5).map((alert, i) => (
                  <div key={alert._id || i} className="fraud-row"
                    style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:4 }}>
                    <div style={{
                      width:32, height:32, borderRadius:10, flexShrink:0,
                      background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                    }}>⚠️</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:"#991b1b",
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {alert.title || "Unknown Credential"}
                      </p>
                      <p style={{ fontSize:11, color:"#b91c1c" }}>
                        {alert.documentType?.replace(/_/g," ") || "Unknown type"}
                      </p>
                    </div>
                    <p style={{ fontSize:11, color:T.muted, flexShrink:0 }}>
                      {new Date(alert.updatedAt || alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </TiltCard>
          </FadeUp>
        </div>

        {/* ── FOOTER CTA ────────────────────────────────────────────────── */}
        <FadeUp delay={200}>
          <div style={{
            marginTop:32, borderRadius:32,
            padding:"40px 48px",
            background:"linear-gradient(135deg,#076b3c 0%,#0ea55e 45%,#2dce7a 100%)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:20,
            boxShadow:"0 24px 72px rgba(7,107,60,0.28)",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:"-40px", right:"-40px", width:180, height:180,
              borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:"-70px", right:"-70px", width:280, height:280,
              borderRadius:"50%", border:"1px solid rgba(255,255,255,0.08)", pointerEvents:"none" }} />

            <div>
              <p style={{ fontSize:12.5, fontWeight:800, color:"rgba(255,255,255,0.65)",
                letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>JOIN THE ECOSYSTEM</p>
              <h3 style={{ fontWeight:800, fontSize:"clamp(20px,2.5vw,30px)", color:"white",
                letterSpacing:"-0.025em", lineHeight:1.2 }}>
                Start verifying credentials today
              </h3>
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <Link to="/register" style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"12px 28px", borderRadius:100,
                background:"white", color:T.forest,
                fontWeight:800, fontSize:14.5, textDecoration:"none",
                boxShadow:"0 6px 24px rgba(0,0,0,0.15)",
                transition:"transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 32px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.15)"; }}>
                Create Account →
              </Link>
              <Link to="/verify" style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"11px 24px", borderRadius:100,
                background:"rgba(255,255,255,0.18)", border:"2px solid rgba(255,255,255,0.45)",
                fontWeight:700, fontSize:14, color:"white", textDecoration:"none",
                backdropFilter:"blur(8px)", transition:"background 0.18s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.18)"}>
                Verify a Credential
              </Link>
            </div>
          </div>
        </FadeUp>

      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ position:"relative", zIndex:1,
        borderTop:"1px solid rgba(45,206,122,0.15)", padding:"28px 32px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:9,
              background:"linear-gradient(145deg,#2dce7a,#076b3c)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, color:"white", fontWeight:800 }}>✦</div>
            <span style={{ fontWeight:800, fontSize:14.5, color:T.deep }}>TrustBridge</span>
            <span style={{ fontSize:12, color:T.muted }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {[["Home","/"],["Verify","/verify"],["About","/about"],["Sign Up","/register"]].map(([l,to]) => (
              <Link key={to} to={to}
                style={{ fontSize:13, fontWeight:600, color:T.muted, textDecoration:"none", transition:"color 0.15s" }}
                onMouseEnter={e => e.target.style.color = T.forest}
                onMouseLeave={e => e.target.style.color = T.muted}>{l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
