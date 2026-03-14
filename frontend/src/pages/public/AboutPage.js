/**
 * TrustBridge — About Page
 * Same design DNA as Landing: morphing orbs · magnetic buttons · tilt cards
 * Editorial layout · timeline · team values · full visual richness
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to LandingPage)
───────────────────────────────────────────────────────────────────────────── */
const T = {
  white: "#ffffff",
  snow: "#f7fdf9",
  mist: "#edfaf3",
  foam: "#d4f5e2",
  mint: "#a8edca",
  jade: "#2dce7a",
  emerald: "#0ea55e",
  forest: "#076b3c",
  deep: "#043d22",
  ink: "#031a0e",
  muted: "#5a7d6a",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.55)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED: MORPHING ORB BACKGROUND
───────────────────────────────────────────────────────────────────────────── */
function MorphOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: "65vw", height: "65vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 40% 40%, #a8edca 0%, #2dce7a22 45%, transparent 70%)",
        animation: "orb1 12s ease-in-out infinite", filter: "blur(1px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", left: "-15%",
        width: "55vw", height: "55vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 60% 60%, #d4f5e2 0%, #0ea55e18 50%, transparent 70%)",
        animation: "orb2 16s ease-in-out infinite", filter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", top: "35%", left: "30%",
        width: "40vw", height: "40vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 50%, #ffffff55 0%, #a8edca11 60%, transparent 75%)",
        animation: "orb3 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "8%", left: "5%",
        width: "22vw", height: "22vw", borderRadius: "50%",
        background: "radial-gradient(ellipse, #edfaf3 0%, transparent 70%)",
        animation: "orb4 9s ease-in-out infinite",
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON
───────────────────────────────────────────────────────────────────────────── */
function MagneticBtn({ children, to, variant = "solid", style: extra = {} }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  }, []);

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
    padding: "14px 34px", borderRadius: 100, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 15,
    textDecoration: "none", border: "none", outline: "none",
    transition: "transform 0.08s ease, box-shadow 0.18s ease, background 0.18s ease",
    transform: hov ? `translate(${pos.x}px,${pos.y}px) scale(1.04)` : "translate(0,0) scale(1)",
    userSelect: "none",
  };

  const solid = {
    background: hov ? "linear-gradient(135deg,#0ea55e,#076b3c)" : "linear-gradient(135deg,#2dce7a,#0ea55e)",
    color: "#fff",
    boxShadow: hov
      ? "0 20px 60px rgba(14,165,94,0.45), 0 4px 12px rgba(14,165,94,0.3), inset 0 1px 0 rgba(255,255,255,0.25)"
      : "0 8px 32px rgba(14,165,94,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
  };

  const outline = {
    background: hov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.78)",
    color: hov ? T.forest : T.emerald,
    border: "2px solid rgba(45,206,122,0.45)",
    backdropFilter: "blur(12px)",
    boxShadow: hov
      ? "0 16px 48px rgba(45,206,122,0.2), inset 0 1px 0 rgba(255,255,255,0.8)"
      : "0 4px 16px rgba(45,206,122,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
  };

  const ghost = {
    background: "transparent", color: hov ? T.forest : T.muted, boxShadow: "none",
  };

  const vs = variant === "solid" ? solid : variant === "outline" ? outline : ghost;

  return (
    <Link to={to} ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setHov(false); }}
      style={{ ...base, ...vs, ...extra }}>
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TILT CARD
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, style: extra = {} }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 50, sy: 50 });
  const [hov, setHov] = useState(false);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (y - 0.5) * -12, ry: (x - 0.5) * 12, sx: x * 100, sy: y * 100 });
  };

  return (
    <div ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ rx: 0, ry: 0, sx: 50, sy: 50 }); }}
      style={{
        position: "relative", overflow: "hidden",
        background: T.glass, border: `1.5px solid ${T.glassBorder}`,
        borderRadius: 28, backdropFilter: "blur(20px)",
        transition: hov ? "transform 0.08s ease, box-shadow 0.08s ease"
          : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
        transform: hov
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.018)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "16px 24px 52px rgba(7,107,60,0.17), 0 4px 16px rgba(7,107,60,0.09)"
          : "6px 10px 28px rgba(7,107,60,0.09), 0 2px 6px rgba(7,107,60,0.05)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 28, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
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
      const step = () => {
        v += Math.ceil((end - v) / 8);
        if (v >= end) { setN(end); return; }
        setN(v); requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   FADE-UP WRAPPER  (scroll reveal)
───────────────────────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, style: extra = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.8s ${delay}ms cubic-bezier(.16,1,.3,1), transform 0.8s ${delay}ms cubic-bezier(.16,1,.3,1)`,
      ...extra,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const PROBLEMS = [
  { icon: "📄", text: "Individuals submit the same documents to dozens of institutions every year" },
  { icon: "🎭", text: "Credential fraud is rampant — forged certificates go undetected for years" },
  { icon: "🐢", text: "Manual verification takes days, blocking access to education, jobs, and services" },
  { icon: "🔀", text: "Education, employment, and finance platforms cannot communicate with each other" },
  { icon: "🔒", text: "No interoperability means trust is rebuilt from scratch at every checkpoint" },
];

const PILLARS = [
  { emoji: "🔐", title: "Cryptographic Integrity", body: "Every credential gets a SHA-256 hash at issuance. Any tampering is detected instantly at verification time — automatically, with zero manual effort." },
  { emoji: "🤖", title: "Groq AI Intelligence", body: "Llama 3 analyzes uploaded documents for missing seals, suspicious formatting, and inconsistencies — then explains every result in plain language." },
  { emoji: "🌐", title: "Cross-Domain Trust", body: "One verified credential works across education, employment, finance, and government. Verified once, trusted everywhere." },
  { emoji: "📡", title: "Real-Time Transparency", body: "The Live Credential Radar gives the entire ecosystem visibility into issuance activity, fraud alerts, and verification trends — in real time." },
  { emoji: "📱", title: "DigiLocker Integration", body: "Verified credentials sync directly to a secure DigiLocker vault via mobile OTP authentication — always accessible, always safe." },
  { emoji: "⭐", title: "Issuer Reputation Engine", body: "Issuers earn trust scores based on issuance quality, revocation history, and verification success rates. Bad actors are surfaced automatically." },
];

const TIMELINE = [
  { year: "Problem", label: "Fragmented Trust", desc: "Modern institutions verify the same documents repeatedly, with no shared trust layer across domains." },
  { year: "Concept", label: "TrustBridge Idea", desc: "Design a unified verification ecosystem where credentials are issued once and trusted everywhere." },
  { year: "Core", label: "Verification Engine", desc: "Build the cryptographic pipeline — SHA-256 hashing, registry comparison, fraud detection, and trust scoring." },
  { year: "AI Layer", label: "Groq Integration", desc: "Add Llama 3 AI for document analysis, verification explanations, and a natural-language assistant." },
  { year: "Ecosystem", label: "Full Platform", desc: "Three-role system (User, Issuer, Verifier), DigiLocker vault, Live Radar, and production-grade security." },
];

const STATS = [
  { n: 10000, suf: "+", label: "Credentials issued" },
  { n: 500, suf: "+", label: "Trusted institutions" },
  { n: 99, suf: "%", label: "Verification accuracy" },
  { n: 3, suf: "s", label: "Average verify time" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navGlass = scrollY > 30;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(170deg,
        #ffffff 0%, #f7fdf9 12%, #edfaf3 28%,
        #d4f5e2 55%, #a8edca 80%, #4dd99a 100%)`,
      fontFamily: "'DM Sans',system-ui,sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>

      {/* ── Global CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-3%,4%) scale(1.06)} 66%{transform:translate(3%,-2%) scale(0.96)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(4%,-3%) scale(1.08)} 70%{transform:translate(-2%,5%) scale(0.94)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-5%,3%)} }
        @keyframes orb4 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(2%,4%) scale(1.1)} }

        @keyframes shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes pulse-ring {
          0%  { box-shadow:0 0 0 0 rgba(45,206,122,0.5); }
          70% { box-shadow:0 0 0 14px rgba(45,206,122,0); }
          100%{ box-shadow:0 0 0 0 rgba(45,206,122,0); }
        }
        @keyframes draw-line {
          from { height:0; }
          to   { height:100%; }
        }

        .shimmer-text {
          background: linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .nav-link {
          padding:8px 16px; border-radius:100px; font-weight:600; font-size:14px;
          color:#3d6b52; text-decoration:none; transition:all 0.18s;
        }
        .nav-link:hover { background:rgba(45,206,122,0.12); color:#076b3c; }

        .pillar-card {
          background:rgba(255,255,255,0.65); border:1.5px solid rgba(255,255,255,0.6);
          border-radius:26px; padding:30px 26px; backdrop-filter:blur(18px);
          transition:transform 0.25s ease, box-shadow 0.25s ease, background 0.25s;
          box-shadow:6px 8px 28px rgba(7,107,60,0.08);
        }
        .pillar-card:hover {
          transform:translateY(-8px) scale(1.01);
          background:rgba(255,255,255,0.88);
          box-shadow:12px 24px 56px rgba(7,107,60,0.16);
        }

        .problem-item {
          display:flex; align-items:flex-start; gap:16px;
          padding:18px 22px; border-radius:20px;
          background:rgba(255,255,255,0.6); border:1.5px solid rgba(255,255,255,0.55);
          backdrop-filter:blur(14px);
          transition:transform 0.22s ease, box-shadow 0.22s ease, background 0.22s;
          box-shadow:4px 6px 20px rgba(7,107,60,0.07);
        }
        .problem-item:hover {
          transform:translateX(6px);
          background:rgba(255,255,255,0.82);
          box-shadow:8px 12px 36px rgba(7,107,60,0.13);
        }

        @media (max-width:768px) {
          .desktop-nav { display:none !important; }
          .mobile-btn  { display:flex !important; }
          .hero-grid   { grid-template-columns:1fr !important; text-align:center; }
          .pillars-grid{ grid-template-columns:1fr !important; }
          .stats-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .timeline-row{ grid-template-columns:1fr !important; }
        }
      `}</style>

      <MorphOrbs />

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        transition: "all 0.35s ease",
        background: navGlass ? "rgba(247,253,249,0.88)" : "transparent",
        backdropFilter: navGlass ? "blur(24px) saturate(180%)" : "none",
        borderBottom: navGlass ? "1px solid rgba(45,206,122,0.15)" : "none",
        boxShadow: navGlass ? "0 2px 32px rgba(7,107,60,0.07)" : "none",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 32px",
          height: 70, display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>

          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "linear-gradient(145deg,#2dce7a,#076b3c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 20px rgba(45,206,122,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              fontSize: 20, color: "white", fontWeight: 800,
            }}>✦</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 18, color: T.deep, lineHeight: 1.1, letterSpacing: "-0.02em" }}>TrustBridge</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.emerald, letterSpacing: "0.1em", lineHeight: 1 }}>CREDENTIAL PLATFORM</p>
            </div>
          </Link>

          <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[["Home", "/"], ["Verify", "/verify"], ["Live Radar", "/radar"]].map(([l, to]) => (
              <Link key={to} to={to} className="nav-link">{l}</Link>
            ))}
          </nav>

          <div className="desktop-nav" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <MagneticBtn to="/login" variant="outline" style={{ padding: "10px 24px", fontSize: 14 }}>Log In</MagneticBtn>
            <MagneticBtn to="/register" variant="solid" style={{ padding: "10px 24px", fontSize: 14 }}>
              Get Started <span style={{ fontSize: 16 }}>→</span>
            </MagneticBtn>
          </div>

          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none", background: "none", border: "none", cursor: "pointer",
              width: 40, height: 40, alignItems: "center", justifyContent: "center",
              borderRadius: 10, color: T.forest, fontSize: 22
            }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div style={{
            background: "rgba(247,253,249,0.98)", backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(45,206,122,0.12)", padding: "16px 32px 24px"
          }}>
            {[["Home", "/"], ["Verify", "/verify"], ["Live Radar", "/radar"], ["Log In", "/login"], ["Get Started →", "/register"]].map(([l, to]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", padding: "13px 0", fontWeight: 600, fontSize: 15,
                  color: T.forest, textDecoration: "none", borderBottom: "1px solid rgba(45,206,122,0.1)"
                }}>{l}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────────────
          HERO — split layout with big headline left, animated quote right
      ───────────────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto",
        padding: "160px 32px 100px"
      }}>

        <div className="hero-grid" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center",
        }}>
          {/* Left */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 18px", borderRadius: 100,
              background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(45,206,122,0.35)",
              backdropFilter: "blur(10px)", marginBottom: 32,
              boxShadow: "0 4px 16px rgba(45,206,122,0.12)",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: "#2dce7a",
                display: "inline-block", animation: "pulse-ring 2s infinite", flexShrink: 0,
              }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.forest, letterSpacing: "0.06em" }}>
                OUR STORY
              </span>
            </div>

            <h1 style={{
              fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.035em",
              color: T.deep, marginBottom: 28,
              fontSize: "clamp(46px,5.5vw,78px)",
            }}>
              Built to{" "}
              <span className="shimmer-text">end</span>
              <br />credential
              <br />fragmentation.
            </h1>

            <p style={{
              fontSize: "clamp(16px,1.6vw,18.5px)", color: T.muted, lineHeight: 1.78,
              maxWidth: 500, marginBottom: 40, fontWeight: 400
            }}>
              TrustBridge was born from a simple observation — people submit the same
              documents over and over again, to institutions that have no way to trust
              each other. We built the bridge.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <MagneticBtn to="/register" variant="solid" style={{ fontSize: 15, padding: "13px 30px" }}>
                Join TrustBridge <span style={{ fontSize: 17 }}>→</span>
              </MagneticBtn>
              <MagneticBtn to="/verify" variant="outline" style={{ fontSize: 14, padding: "12px 26px" }}>
                Verify a Credential
              </MagneticBtn>
            </div>
          </div>

          {/* Right — large quote card */}
          <TiltCard style={{ padding: "44px 40px" }}>
            <div style={{
              height: 5, borderRadius: 100, marginBottom: 36,
              background: "linear-gradient(90deg,#2dce7a,#0ea55e,#076b3c)"
            }} />

            <p style={{
              fontSize: 11, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 18
            }}>MISSION STATEMENT</p>

            <p style={{
              fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: T.deep,
              lineHeight: 1.55, letterSpacing: "-0.02em", marginBottom: 32,
              fontStyle: "italic",
            }}>
              "A world where your credentials follow you — not the other way around.
              Verified once. Trusted everywhere. Forever."
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {[["🎓", "Education"], ["💼", "Employment"], ["🏦", "Finance"], ["🏛️", "Government"]].map(([e, l]) => (
                <div key={l} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 100,
                  background: "rgba(212,245,226,0.6)", border: "1px solid rgba(45,206,122,0.25)",
                }}>
                  <span style={{ fontSize: 15 }}>{e}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.forest }}>{l}</span>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          STATS BAND
      ───────────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 100px" }}>
        <FadeUp>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            gap: 20, className: "stats-grid",
          }} className="stats-grid">
            {STATS.map(({ n, suf, label }) => (
              <TiltCard key={label} style={{ padding: "28px 20px", textAlign: "center" }}>
                <p style={{
                  fontWeight: 800, fontSize: 44, color: T.forest,
                  letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8,
                  background: "linear-gradient(135deg,#0ea55e,#2dce7a)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  <Counter end={n} suffix={suf} />
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>{label}</p>
              </TiltCard>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          THE PROBLEM — animated list
      ───────────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="hero-grid">

          {/* Left — sticky heading */}
          <FadeUp>
            <div style={{ position: "sticky", top: 120 }}>
              <p style={{
                fontSize: 12, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: 16
              }}>THE PROBLEM</p>
              <h2 style={{
                fontWeight: 800, fontSize: "clamp(32px,4vw,52px)", color: T.deep,
                letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24
              }}>
                Trust is broken<br />everywhere.
              </h2>
              <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.75, maxWidth: 380, fontWeight: 400 }}>
                Modern digital ecosystems are fragmented. Every institution re-verifies
                the same credentials, creating endless friction, fraud, and failure.
              </p>

              {/* Decorative bracket */}
              <div style={{
                marginTop: 36, padding: "20px 24px", borderRadius: 20,
                background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(45,206,122,0.25)",
                backdropFilter: "blur(12px)"
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.emerald, marginBottom: 8 }}>
                  The result?
                </p>
                <p style={{ fontSize: 15, fontWeight: 800, color: T.deep, lineHeight: 1.5 }}>
                  Billions of hours wasted.<br />
                  Millions of credentials forged.<br />
                  Zero shared trust layer.
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Right — problem list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {PROBLEMS.map(({ icon, text }, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="problem-item">
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: "linear-gradient(135deg,rgba(212,245,226,0.9),rgba(168,237,202,0.6))",
                    border: "1px solid rgba(45,206,122,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, boxShadow: "0 4px 12px rgba(45,206,122,0.15)",
                  }}>{icon}</div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: T.deep, lineHeight: 1.6 }}>{text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          OUR SOLUTION — 6 pillars grid
      ───────────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 100px" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{
              fontSize: 12, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 14
            }}>OUR SOLUTION</p>
            <h2 style={{
              fontWeight: 800, fontSize: "clamp(30px,4vw,52px)", color: T.deep,
              letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: 560, margin: "0 auto 16px"
            }}>
              Six pillars of the TrustBridge ecosystem
            </h2>
            <p style={{ fontSize: 17, color: T.muted, maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
              Every feature is designed to solve a specific failure mode in the global credential system.
            </p>
          </div>
        </FadeUp>

        <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {PILLARS.map(({ emoji, title, body }, i) => (
            <FadeUp key={title} delay={i * 60}>
              <div className="pillar-card">
                <div style={{
                  width: 52, height: 52, borderRadius: 18, marginBottom: 20,
                  background: "linear-gradient(135deg,rgba(212,245,226,0.9),rgba(168,237,202,0.6))",
                  border: "1px solid rgba(45,206,122,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, boxShadow: "0 4px 16px rgba(45,206,122,0.15)",
                }}>{emoji}</div>
                <h3 style={{
                  fontWeight: 800, fontSize: 17, color: T.deep,
                  marginBottom: 10, letterSpacing: "-0.02em"
                }}>{title}</h3>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7 }}>{body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          TIMELINE — how we got here
      ───────────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 100px" }}>
        <FadeUp>
          <TiltCard style={{ padding: "56px 48px" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{
                fontSize: 12, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: 14
              }}>THE JOURNEY</p>
              <h2 style={{
                fontWeight: 800, fontSize: "clamp(28px,3.5vw,46px)", color: T.deep,
                letterSpacing: "-0.03em"
              }}>
                How TrustBridge came to be
              </h2>
            </div>

            <div style={{ position: "relative" }}>
              {/* Vertical line */}
              <div style={{
                position: "absolute", left: "50%", top: 0, bottom: 0, width: 2,
                background: "linear-gradient(180deg,#2dce7a,#0ea55e44)",
                transform: "translateX(-50%)", borderRadius: 99,
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {TIMELINE.map(({ year, label, desc }, i) => (
                  <FadeUp key={year} delay={i * 100}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
                      alignItems: "center",
                    }} className="timeline-row">
                      {/* Left side (even) or right side (odd) */}
                      {i % 2 === 0 ? (
                        <>
                          <div style={{ textAlign: "right", paddingRight: 40 }}>
                            <span style={{
                              display: "inline-block", padding: "5px 16px", borderRadius: 100,
                              background: "rgba(212,245,226,0.7)", border: "1px solid rgba(45,206,122,0.3)",
                              fontSize: 11.5, fontWeight: 800, color: T.forest,
                              letterSpacing: "0.06em", marginBottom: 10
                            }}>{year}</span>
                            <h3 style={{
                              fontWeight: 800, fontSize: 18, color: T.deep,
                              letterSpacing: "-0.02em", marginBottom: 8
                            }}>{label}</h3>
                            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65 }}>{desc}</p>
                          </div>
                          {/* Center dot */}
                          <div style={{ position: "relative" }}>
                            <div style={{
                              position: "absolute", left: "-28px", top: "50%", transform: "translate(-50%,-50%)",
                              width: 16, height: 16, borderRadius: "50%",
                              background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
                              boxShadow: "0 0 0 4px rgba(45,206,122,0.2), 0 4px 12px rgba(45,206,122,0.3)",
                              zIndex: 2,
                            }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ position: "relative" }}>
                            <div style={{
                              position: "absolute", right: "-28px", top: "50%", transform: "translate(50%,-50%)",
                              width: 16, height: 16, borderRadius: "50%",
                              background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
                              boxShadow: "0 0 0 4px rgba(45,206,122,0.2), 0 4px 12px rgba(45,206,122,0.3)",
                              zIndex: 2,
                            }} />
                          </div>
                          <div style={{ paddingLeft: 40 }}>
                            <span style={{
                              display: "inline-block", padding: "5px 16px", borderRadius: 100,
                              background: "rgba(212,245,226,0.7)", border: "1px solid rgba(45,206,122,0.3)",
                              fontSize: 11.5, fontWeight: 800, color: T.forest,
                              letterSpacing: "0.06em", marginBottom: 10
                            }}>{year}</span>
                            <h3 style={{
                              fontWeight: 800, fontSize: 18, color: T.deep,
                              letterSpacing: "-0.02em", marginBottom: 8
                            }}>{label}</h3>
                            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65 }}>{desc}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </TiltCard>
        </FadeUp>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          CTA BANNER
      ───────────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 120px" }}>
        <FadeUp>
          <div style={{
            borderRadius: 40, padding: "80px 56px", textAlign: "center",
            background: "linear-gradient(135deg,#076b3c 0%,#0ea55e 40%,#2dce7a 100%)",
            position: "relative", overflow: "hidden",
            boxShadow: "0 32px 96px rgba(7,107,60,0.35), 0 8px 32px rgba(7,107,60,0.2)",
          }}>
            {/* Decorative rings */}
            <div style={{
              position: "absolute", top: -80, right: -80, width: 320, height: 320,
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute", top: -40, right: -40, width: 200, height: 200,
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute", bottom: -60, left: -60, width: 280, height: 280,
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute", top: "50%", left: "8%", transform: "translateY(-50%)",
              fontSize: 80, opacity: 0.06, lineHeight: 1, userSelect: "none", color: "white"
            }}>✦</div>
            <div style={{
              position: "absolute", top: "20%", right: "6%",
              fontSize: 60, opacity: 0.08, lineHeight: 1, userSelect: "none", color: "white"
            }}>✦</div>

            <p style={{
              fontSize: 12.5, fontWeight: 800, color: "rgba(255,255,255,0.65)",
              letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20
            }}>
              JOIN THE ECOSYSTEM
            </p>
            <h2 style={{
              fontWeight: 800, fontSize: "clamp(28px,4.5vw,56px)", color: "white",
              letterSpacing: "-0.035em", lineHeight: 1.08, maxWidth: 560, margin: "0 auto 18px"
            }}>
              Ready to build trust?
            </h2>
            <p style={{
              fontSize: 18, color: "rgba(255,255,255,0.78)", maxWidth: 420,
              margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 400
            }}>
              Join TrustBridge as an individual, issuer, or verifier — and become part of
              the ecosystem that's fixing credential trust.
            </p>

            <div style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "center", gap: 14
            }}>
              <Link to="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "15px 38px", borderRadius: 100,
                background: "white", color: T.forest,
                fontWeight: 800, fontSize: 16, textDecoration: "none",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.22)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)"; }}>
                Create Free Account <span style={{ fontSize: 18 }}>→</span>
              </Link>
              <Link to="/" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 30px", borderRadius: 100,
                background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.48)",
                fontWeight: 700, fontSize: 15, color: "white", textDecoration: "none",
                backdropFilter: "blur(8px)", transition: "background 0.18s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(45,206,122,0.15)", padding: "36px 32px"
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "linear-gradient(145deg,#2dce7a,#076b3c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "white", fontWeight: 800
            }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: 15, color: T.deep, letterSpacing: "-0.02em" }}>TrustBridge</span>
            <span style={{ fontSize: 12, color: T.muted }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[["Home", "/"], ["Verify", "/verify"], ["Live Radar", "/radar"], ["Sign Up", "/register"]].map(([l, to]) => (
              <Link key={to} to={to}
                style={{ fontSize: 13, fontWeight: 600, color: T.muted, textDecoration: "none", transition: "color 0.15s" }}
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
