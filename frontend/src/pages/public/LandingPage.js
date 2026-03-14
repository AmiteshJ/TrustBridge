/**
 * TrustBridge — Luxury Editorial Landing Page
 * Concept: Bold asymmetric layout · Oversized typography · Morphing orbs
 * White + deep green gradient · Claymorphism cards with rich hover physics
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
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
  ghost: "rgba(255,255,255,0.08)",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.55)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   MORPHING ORB BACKGROUND
───────────────────────────────────────────────────────────────────────────── */
function MorphOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Main large orb — top right */}
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: "65vw", height: "65vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 40% 40%, #a8edca 0%, #2dce7a22 45%, transparent 70%)",
        animation: "orb1 12s ease-in-out infinite",
        filter: "blur(1px)",
      }} />
      {/* Second orb — bottom left */}
      <div style={{
        position: "absolute", bottom: "-20%", left: "-15%",
        width: "55vw", height: "55vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 60% 60%, #d4f5e2 0%, #0ea55e18 50%, transparent 70%)",
        animation: "orb2 16s ease-in-out infinite",
        filter: "blur(2px)",
      }} />
      {/* Accent orb — center */}
      <div style={{
        position: "absolute", top: "35%", left: "30%",
        width: "40vw", height: "40vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 50%, #ffffff55 0%, #a8edca11 60%, transparent 75%)",
        animation: "orb3 20s ease-in-out infinite",
      }} />
      {/* Small accent — top left */}
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
   MAGNETIC BUTTON — follows cursor on hover
───────────────────────────────────────────────────────────────────────────── */
function MagneticBtn({ children, to, variant = "solid", style: extraStyle = {} }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setPos({ x: (e.clientX - cx) * 0.28, y: (e.clientY - cy) * 0.28 });
  }, []);

  const reset = () => { setPos({ x: 0, y: 0 }); setHov(false); };

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
    padding: "14px 34px", borderRadius: 100, cursor: "pointer",
    fontFamily: "'Cabinet Grotesk','DM Sans',sans-serif",
    fontWeight: 800, fontSize: 15, letterSpacing: "0.01em",
    textDecoration: "none", border: "none", outline: "none",
    transition: "transform 0.08s ease, box-shadow 0.18s ease, background 0.18s ease",
    transform: hov ? `translate(${pos.x}px,${pos.y}px) scale(1.04)` : "translate(0,0) scale(1)",
    willChange: "transform",
    userSelect: "none",
  };

  const solid = {
    background: hov
      ? "linear-gradient(135deg,#0ea55e,#076b3c)"
      : "linear-gradient(135deg,#2dce7a,#0ea55e)",
    color: "#ffffff",
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
    background: "transparent",
    color: hov ? T.forest : T.muted,
    boxShadow: "none",
  };

  const variantStyle = variant === "solid" ? solid : variant === "outline" ? outline : ghost;

  return (
    <Link to={to} ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={reset}
      style={{ ...base, ...variantStyle, ...extraStyle }}>
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TILT CARD — 3D perspective tilt on hover
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, style: extra = {} }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, shine: { x: 50, y: 50 } });
  const [hov, setHov] = useState(false);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (y - 0.5) * -14, ry: (x - 0.5) * 14, shine: { x: x * 100, y: y * 100 } });
  };

  const base = {
    position: "relative", overflow: "hidden",
    background: T.glass,
    border: `1.5px solid ${T.glassBorder}`,
    borderRadius: 28,
    backdropFilter: "blur(20px)",
    transition: hov
      ? "transform 0.08s ease, box-shadow 0.08s ease"
      : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
    transform: hov
      ? `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.02)`
      : "perspective(800px) rotateX(0) rotateY(0) scale(1)",
    boxShadow: hov
      ? "16px 24px 48px rgba(7,107,60,0.18), 0 4px 16px rgba(7,107,60,0.1)"
      : "6px 10px 28px rgba(7,107,60,0.1), 0 2px 6px rgba(7,107,60,0.06)",
  };

  return (
    <div ref={ref} style={{ ...base, ...extra }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ rx: 0, ry: 0, shine: { x: 50, y: 50 } }); }}>
      {/* Shine layer */}
      {hov && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 28,
          background: `radial-gradient(circle at ${tilt.shine.x}% ${tilt.shine.y}%, rgba(255,255,255,0.22) 0%, transparent 55%)`,
          zIndex: 2,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTER — counts up on scroll-into-view
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
   DATA
───────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { emoji: "🔐", title: "Verified Once", body: "Issue once, trust everywhere. Your credentials flow across every institution without re-submission." },
  { emoji: "⚡", title: "Instant Verification", body: "Verify credentials in under 3 seconds via Credential ID, QR code, or a direct shareable link." },
  { emoji: "🛡️", title: "SHA-256 Fraud Detection", body: "Cryptographic hashing detects any tampering at the moment of verification — automatically." },
  { emoji: "🌐", title: "DigiLocker Vault", body: "Sync verified credentials to a secure DigiLocker-linked vault with mobile OTP authentication." },
  { emoji: "🤖", title: "Groq AI Analysis", body: "Llama 3 analyzes documents, finds anomalies, and explains every verification in plain language." },
  { emoji: "📡", title: "Live Radar Dashboard", body: "Real-time issuance feeds, fraud alerts, and ecosystem activity visible to the entire network." },
];

const STEPS = [
  { n: "01", label: "Upload", desc: "User uploads credential file" },
  { n: "02", label: "Review", desc: "Issuer approves the request" },
  { n: "03", label: "Hash", desc: "SHA-256 tamper check runs" },
  { n: "04", label: "Score", desc: "Trust score 0–100 assigned" },
  { n: "05", label: "Wallet", desc: "Stored in digital wallet" },
  { n: "06", label: "Share", desc: "Verified anywhere, instantly" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
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
        #ffffff   0%,
        #f7fdf9   12%,
        #edfaf3   28%,
        #d4f5e2   55%,
        #a8edca   80%,
        #4dd99a   100%)`,
      fontFamily: "'DM Sans','Cabinet Grotesk',system-ui,sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>
      {/* ── Global CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes orb1 {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(-3%,4%) scale(1.06); }
          66%      { transform:translate(3%,-2%) scale(0.96); }
        }
        @keyframes orb2 {
          0%,100% { transform:translate(0,0) scale(1); }
          40%      { transform:translate(4%,-3%) scale(1.08); }
          70%      { transform:translate(-2%,5%) scale(0.94); }
        }
        @keyframes orb3 {
          0%,100% { transform:translate(0,0); }
          50%      { transform:translate(-5%,3%); }
        }
        @keyframes orb4 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(2%,4%) scale(1.1); }
        }
        @keyframes floatCard {
          0%,100% { transform:translateY(0px) rotate(-1.5deg); }
          50%      { transform:translateY(-18px) rotate(-1.5deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow:0 0 0 0 rgba(45,206,122,0.5); }
          70%  { box-shadow:0 0 0 14px rgba(45,206,122,0); }
          100% { box-shadow:0 0 0 0 rgba(45,206,122,0); }
        }

        .hero-animate { animation:fadeUp 0.9s cubic-bezier(.16,1,.3,1) both; }
        .hero-animate-2 { animation:fadeUp 0.9s 0.15s cubic-bezier(.16,1,.3,1) both; }
        .hero-animate-3 { animation:fadeUp 0.9s 0.28s cubic-bezier(.16,1,.3,1) both; }
        .hero-animate-4 { animation:fadeUp 0.9s 0.42s cubic-bezier(.16,1,.3,1) both; }

        .shimmer-text {
          background: linear-gradient(90deg, #0ea55e 0%, #2dce7a 30%, #a8edca 50%, #2dce7a 70%, #0ea55e 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .nav-link {
          padding:8px 16px; border-radius:100px;
          font-weight:600; font-size:14px; color:#3d6b52;
          text-decoration:none; transition:all 0.18s ease;
        }
        .nav-link:hover { background:rgba(45,206,122,0.12); color:#076b3c; }

        .step-card {
          background:rgba(255,255,255,0.6); border:1.5px solid rgba(255,255,255,0.55);
          border-radius:22px; padding:24px 20px; text-align:center;
          backdrop-filter:blur(14px);
          transition:transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow:4px 6px 20px rgba(7,107,60,0.08);
        }
        .step-card:hover {
          transform:translateY(-8px);
          box-shadow:8px 20px 48px rgba(7,107,60,0.15);
        }

        .feature-card {
          background:rgba(255,255,255,0.65);
          border:1.5px solid rgba(255,255,255,0.6);
          border-radius:26px; padding:30px 26px;
          backdrop-filter:blur(18px);
          transition:transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-shadow:6px 8px 28px rgba(7,107,60,0.08);
          cursor:default;
        }
        .feature-card:hover {
          transform:translateY(-8px) scale(1.01);
          background:rgba(255,255,255,0.85);
          box-shadow:12px 24px 56px rgba(7,107,60,0.16);
        }

        .role-card {
          background:rgba(255,255,255,0.68);
          border:1.5px solid rgba(255,255,255,0.58);
          border-radius:28px; padding:36px 28px;
          text-align:center; backdrop-filter:blur(18px);
          text-decoration:none;
          transition:transform 0.26s cubic-bezier(.16,1,.3,1), box-shadow 0.26s ease;
          box-shadow:6px 8px 28px rgba(7,107,60,0.08);
          display:block;
        }
        .role-card:hover {
          transform:translateY(-10px) scale(1.02);
          box-shadow:14px 30px 60px rgba(7,107,60,0.18);
        }

        @media (max-width:768px) {
          .desktop-nav { display:none !important; }
          .mobile-btn  { display:flex !important; }
          .hero-grid   { grid-template-columns:1fr !important; }
          .features-grid { grid-template-columns:1fr !important; }
          .roles-grid  { grid-template-columns:1fr !important; }
          .steps-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .stats-row   { grid-template-columns:repeat(2,1fr) !important; }
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

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "linear-gradient(145deg,#2dce7a,#076b3c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 20px rgba(45,206,122,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              fontSize: 20, lineHeight: 1,
            }}>✦</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 18, color: T.deep, lineHeight: 1.1, letterSpacing: "-0.02em" }}>TrustBridge</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.emerald, letterSpacing: "0.1em", lineHeight: 1 }}>CREDENTIAL PLATFORM</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[["About", "/about"], ["Verify", "/verify"], ["Live Radar", "/radar"]].map(([l, to]) => (
              <Link key={to} to={to} className="nav-link">{l}</Link>
            ))}
          </nav>

          {/* Nav CTAs */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MagneticBtn to="/login" variant="outline" style={{ padding: "10px 24px", fontSize: 14 }}>Log In</MagneticBtn>
            <MagneticBtn to="/register" variant="solid" style={{ padding: "10px 24px", fontSize: 14 }}>
              Sign Up Free
              <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
            </MagneticBtn>
          </div>

          {/* Mobile toggle */}
          <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none", background: "none", border: "none", cursor: "pointer",
              width: 40, height: 40, alignItems: "center", justifyContent: "center",
              borderRadius: 10, color: T.forest, fontSize: 22
            }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: "rgba(247,253,249,0.98)", backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(45,206,122,0.12)", padding: "16px 32px 24px"
          }}>
            {[["About", "/about"], ["Verify", "/verify"], ["Live Radar", "/radar"], ["Log In", "/login"], ["Sign Up Free →", "/register"]].map(([l, to]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", padding: "13px 0", fontWeight: 600, fontSize: 15,
                  color: T.forest, textDecoration: "none",
                  borderBottom: "1px solid rgba(45,206,122,0.1)"
                }}>{l}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto",
        padding: "160px 32px 100px", minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center"
      }}>

        <div className="hero-grid" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center",
        }}>
          {/* Left column — text */}
          <div>
            {/* Eyebrow pill */}
            <div className="hero-animate" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 18px", borderRadius: 100,
              background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(45,206,122,0.35)",
              backdropFilter: "blur(10px)", marginBottom: 32,
              boxShadow: "0 4px 16px rgba(45,206,122,0.12)",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: "#2dce7a",
                display: "inline-block", animation: "pulse-ring 2s infinite",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.forest, letterSpacing: "0.06em" }}>
                UNIVERSAL CREDENTIAL VERIFICATION
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-animate-2" style={{
              fontWeight: 800, lineHeight: 1.03, letterSpacing: "-0.035em",
              marginBottom: 28, color: T.deep,
              fontSize: "clamp(48px,5.5vw,76px)",
            }}>
              Verify once.
              <br />
              <span className="shimmer-text">Trust</span>
              <br />
              <span style={{ color: T.deep }}>everywhere.</span>
            </h1>

            <p className="hero-animate-3" style={{
              fontSize: "clamp(16px,1.6vw,19px)", color: T.muted, lineHeight: 1.75,
              maxWidth: 480, marginBottom: 44, fontWeight: 400,
            }}>
              A unified digital credential ecosystem where credentials are
              verified once and securely reused across education, employment,
              finance — and beyond.
            </p>

            {/* ── THREE BUTTONS ─────────────────────────────────────────────── */}
            <div className="hero-animate-4" style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14,
              marginBottom: 56,
            }}>
              <MagneticBtn to="/register" variant="solid" style={{ fontSize: 16, padding: "15px 38px" }}>
                Sign in to continue
                <span style={{ fontSize: 18 }}>→</span>
              </MagneticBtn>

              <MagneticBtn to="/login" variant="outline" style={{ fontSize: 15, padding: "14px 30px" }}>
                Log In
              </MagneticBtn>

              <MagneticBtn to="/about" variant="ghost" style={{ fontSize: 14.5, padding: "14px 20px", color: T.muted }}>
                About →
              </MagneticBtn>
            </div>

            {/* Stats row */}
            <div className="stats-row" style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16,
            }}>
              {[
                { n: 10000, suf: "+", label: "Credentials Issued" },
                { n: 500, suf: "+", label: "Institutions" },
                { n: 99, suf: "%", label: "Accuracy" },
              ].map(({ n, suf, label }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.65)", backdropFilter: "blur(14px)",
                  border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: 20,
                  padding: "18px 14px", textAlign: "center",
                  boxShadow: "4px 6px 20px rgba(7,107,60,0.08)",
                }}>
                  <p style={{
                    fontWeight: 800, fontSize: 30, color: T.forest,
                    letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4
                  }}>
                    <Counter end={n} suffix={suf} />
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: T.muted, lineHeight: 1.2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — floating credential card */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{
              width: "100%", maxWidth: 380,
              animation: "floatCard 6s ease-in-out infinite",
              filter: "drop-shadow(0 32px 64px rgba(7,107,60,0.18))",
            }}>
              <TiltCard style={{ padding: 0 }}>
                {/* Card top gradient bar */}
                <div style={{
                  height: 6, borderRadius: "28px 28px 0 0",
                  background: "linear-gradient(90deg,#2dce7a,#0ea55e,#076b3c)",
                }} />

                <div style={{ padding: "28px 28px 24px" }}>
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 14,
                        background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, boxShadow: "0 6px 16px rgba(45,206,122,0.3)",
                      }}>🎓</div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 14.5, color: T.deep, lineHeight: 1.2 }}>B.Tech Computer Science</p>
                        <p style={{ fontSize: 12, color: T.muted, fontWeight: 500, marginTop: 2 }}>University of Mumbai</p>
                      </div>
                    </div>
                    <span style={{
                      background: "linear-gradient(135deg,#d4f5e2,#a8edca)",
                      color: "#043d22", fontSize: 10.5, fontWeight: 800,
                      padding: "5px 12px", borderRadius: 100,
                      border: "1px solid rgba(45,206,122,0.3)",
                      whiteSpace: "nowrap",
                    }}>✓ VERIFIED</span>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      ["Holder", "Arjun Sharma"],
                      ["Trust Score", "94 / 100"],
                      ["Issued", "Nov 2024"],
                      ["DigiLocker", "✓ Synced"],
                    ].map(([k, v]) => (
                      <div key={k} style={{
                        background: "rgba(212,245,226,0.5)", borderRadius: 14, padding: "11px 14px",
                        border: "1px solid rgba(168,237,202,0.4)",
                      }}>
                        <p style={{
                          fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em",
                          textTransform: "uppercase", marginBottom: 4
                        }}>{k}</p>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: T.deep }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Trust bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: T.muted }}>Trust Score</span>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: T.forest }}>94%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 100, background: "rgba(168,237,202,0.4)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: "94%", borderRadius: 100,
                        background: "linear-gradient(90deg,#2dce7a,#0ea55e)",
                        boxShadow: "0 0 12px rgba(45,206,122,0.5)",
                      }} />
                    </div>
                  </div>

                  {/* Card footer */}
                  <div style={{
                    background: "rgba(212,245,226,0.4)", borderRadius: 16, padding: "11px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    border: "1px solid rgba(168,237,202,0.35)",
                  }}>
                    <code style={{
                      fontSize: 11.5, fontWeight: 700, color: T.emerald,
                      fontFamily: "'JetBrains Mono','Fira Code',monospace",
                    }}>TB-A4F8•C2D1•E3B5</code>
                    <div style={{ display: "flex", gap: 7 }}>
                      {[["QR", "#dbeafe", "#1d4ed8"], ["Share", "#ede9fe", "#5b21b6"]].map(([l, bg, c]) => (
                        <span key={l} style={{
                          fontSize: 10.5, fontWeight: 700, color: c, background: bg,
                          padding: "4px 10px", borderRadius: 8
                        }}>{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 120px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{
            fontSize: 12, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
            textTransform: "uppercase", marginBottom: 14
          }}>PLATFORM CAPABILITIES</p>
          <h2 style={{
            fontWeight: 800, fontSize: "clamp(30px,4vw,52px)", color: T.deep,
            letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: 520, margin: "0 auto"
          }}>
            Everything you need for credential trust
          </h2>
        </div>

        <div className="features-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22,
        }}>
          {FEATURES.map(({ emoji, title, body }) => (
            <div key={title} className="feature-card">
              <div style={{
                width: 52, height: 52, borderRadius: 18, marginBottom: 20,
                background: "linear-gradient(135deg,rgba(212,245,226,0.9),rgba(168,237,202,0.6))",
                border: "1px solid rgba(45,206,122,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, boxShadow: "0 4px 16px rgba(45,206,122,0.15)",
              }}>{emoji}</div>
              <h3 style={{
                fontWeight: 800, fontSize: 17, color: T.deep, marginBottom: 10,
                letterSpacing: "-0.02em"
              }}>{title}</h3>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, fontWeight: 400 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLES ──────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 120px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{
            fontSize: 12, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
            textTransform: "uppercase", marginBottom: 14
          }}>THREE ROLES</p>
          <h2 style={{
            fontWeight: 800, fontSize: "clamp(30px,4vw,52px)", color: T.deep,
            letterSpacing: "-0.03em", lineHeight: 1.1
          }}>
            Built for every role in the ecosystem
          </h2>
        </div>

        <div className="roles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {[
            {
              emoji: "👤", role: "Individual", accent: "#2dce7a", shadow: "rgba(45,206,122,0.2)",
              desc: "Own your credentials. Store them in your wallet, sync to DigiLocker, share with anyone instantly."
            },
            {
              emoji: "🏛️", role: "Issuer", accent: "#3b82f6", shadow: "rgba(59,130,246,0.2)",
              desc: "Issue tamper-proof credentials as a university, certification body, or company with full audit trails."
            },
            {
              emoji: "🔍", role: "Verifier", accent: "#8b5cf6", shadow: "rgba(139,92,246,0.2)",
              desc: "Verify credential authenticity in seconds via ID, QR code, or direct link — with AI explanation."
            },
          ].map(({ emoji, role, accent, shadow, desc }) => (
            <Link key={role} to="/register" className="role-card"
              style={{
                boxShadow: `6px 8px 28px ${shadow}`,
                border: `1.5px solid rgba(255,255,255,0.58)`,
              }}>
              <div style={{
                width: 68, height: 68, borderRadius: 24, margin: "0 auto 22px",
                background: `linear-gradient(135deg,${accent}22,${accent}11)`,
                border: `2px solid ${accent}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, boxShadow: `0 8px 24px ${shadow}`,
              }}>{emoji}</div>
              <h3 style={{
                fontWeight: 800, fontSize: 22, color: T.deep, marginBottom: 12,
                letterSpacing: "-0.025em"
              }}>{role}</h3>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 28 }}>{desc}</p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `linear-gradient(135deg,${accent},${accent}cc)`,
                color: "white", fontWeight: 700, fontSize: 14,
                padding: "10px 24px", borderRadius: 100,
                boxShadow: `0 6px 20px ${shadow}`,
              }}>
                Get Started <span style={{ fontSize: 16 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 120px" }}>
        <TiltCard style={{ padding: "56px 48px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{
              fontSize: 12, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 14
            }}>THE PROCESS</p>
            <h2 style={{
              fontWeight: 800, fontSize: "clamp(28px,3.5vw,46px)", color: T.deep,
              letterSpacing: "-0.03em"
            }}>
              How TrustBridge works
            </h2>
          </div>

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16 }}>
            {STEPS.map(({ n, label, desc }, i) => (
              <div key={n} className="step-card" style={{ position: "relative" }}>
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute", top: 36, right: -9, width: 18, height: 2,
                    background: "linear-gradient(90deg,rgba(45,206,122,0.5),transparent)",
                    zIndex: 10,
                  }} />
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: 16, margin: "0 auto 12px",
                  background: "linear-gradient(135deg,#d4f5e2,#a8edca)",
                  border: "1.5px solid rgba(45,206,122,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 13, color: T.forest,
                  letterSpacing: "0.05em",
                }}>{n}</div>
                <p style={{
                  fontWeight: 800, fontSize: 14, color: T.deep, marginBottom: 6,
                  letterSpacing: "-0.01em"
                }}>{label}</p>
                <p style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </TiltCard>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px 120px" }}>
        <div style={{
          borderRadius: 40, padding: "80px 56px", textAlign: "center",
          background: "linear-gradient(135deg,#076b3c 0%,#0ea55e 40%,#2dce7a 100%)",
          position: "relative", overflow: "hidden",
          boxShadow: "0 32px 96px rgba(7,107,60,0.35), 0 8px 32px rgba(7,107,60,0.2)",
        }}>
          {/* Decorative */}
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
            fontSize: 80, opacity: 0.06, lineHeight: 1, userSelect: "none"
          }}>✦</div>
          <div style={{
            position: "absolute", top: "20%", right: "6%",
            fontSize: 60, opacity: 0.08, lineHeight: 1, userSelect: "none"
          }}>✦</div>

          <p style={{
            fontSize: 12.5, fontWeight: 800, color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20
          }}>
            START TODAY
          </p>
          <h2 style={{
            fontWeight: 800, fontSize: "clamp(28px,4.5vw,56px)", color: "white",
            letterSpacing: "-0.035em", lineHeight: 1.08, maxWidth: 580, margin: "0 auto 20px"
          }}>
            Start verifying credentials today
          </h2>
          <p style={{
            fontSize: 18, color: "rgba(255,255,255,0.78)", maxWidth: 420,
            margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 400
          }}>
            Join thousands of individuals, institutions, and organizations who trust TrustBridge.
          </p>

          {/* Three CTA buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 14 }}>
            {/* Primary */}
            <Link to="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "15px 38px", borderRadius: 100,
              background: "white", color: T.forest,
              fontWeight: 800, fontSize: 16, textDecoration: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)"; }}>
              Sign in to continue <span style={{ fontSize: 18 }}>→</span>
            </Link>

            {/* Secondary */}
            <Link to="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 100,
              background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.5)",
              fontWeight: 700, fontSize: 15, color: "white", textDecoration: "none",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Log In
            </Link>

            {/* Ghost */}
            <Link to="/about" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "14px 20px", borderRadius: 100,
              fontWeight: 600, fontSize: 15, color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              transition: "color 0.18s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>
              About TrustBridge →
            </Link>
          </div>
        </div>
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
            {[["Verify", "/verify"], ["Live Radar", "/radar"], ["About", "/about"], ["Sign Up", "/register"]].map(([l, to]) => (
              <Link key={to} to={to} style={{
                fontSize: 13, fontWeight: 600, color: T.muted,
                textDecoration: "none", transition: "color 0.15s"
              }}
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
