/**
 * TrustBridge — Login Page
 * Split-screen layout · morphing orbs · magnetic submit · tilt form card
 * Full functionality preserved: 2FA OTP redirect, role-based navigation
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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
  muted: "#5a7d6a",
  glass: "rgba(255,255,255,0.75)",
  glassBorder: "rgba(255,255,255,0.6)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   MORPHING ORBS
───────────────────────────────────────────────────────────────────────────── */
function MorphOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", top: "-20%", right: "-12%",
        width: "70vw", height: "70vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 40% 40%, #a8edca 0%, #2dce7a22 45%, transparent 70%)",
        animation: "orb1 12s ease-in-out infinite", filter: "blur(1px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-25%", left: "-15%",
        width: "60vw", height: "60vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 60% 60%, #d4f5e2 0%, #0ea55e18 50%, transparent 70%)",
        animation: "orb2 16s ease-in-out infinite", filter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "20%",
        width: "45vw", height: "45vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 50%, #ffffff44 0%, #a8edca0e 60%, transparent 75%)",
        animation: "orb3 20s ease-in-out infinite",
      }} />
    </div>
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
    setTilt({ rx: (y - 0.5) * -10, ry: (x - 0.5) * 10, sx: x * 100, sy: y * 100 });
  };

  return (
    <div ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ rx: 0, ry: 0, sx: 50, sy: 50 }); }}
      style={{
        position: "relative", overflow: "hidden",
        background: T.glass, border: `1.5px solid ${T.glassBorder}`,
        borderRadius: 32, backdropFilter: "blur(24px)",
        transition: hov
          ? "transform 0.08s ease, box-shadow 0.08s ease"
          : "transform 0.55s cubic-bezier(.2,.8,.2,1), box-shadow 0.55s ease",
        transform: hov
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.01)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "20px 28px 56px rgba(7,107,60,0.18), 0 4px 16px rgba(7,107,60,0.1)"
          : "8px 14px 36px rgba(7,107,60,0.11), 0 2px 8px rgba(7,107,60,0.06)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 32, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.18) 0%, transparent 58%)`,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM INPUT  — styled to match design system
───────────────────────────────────────────────────────────────────────────── */
function FloatInput({ label, name, type = "text", value, onChange, placeholder, required, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const hasVal = value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <label style={{
        position: "absolute", left: 18,
        top: (focused || hasVal) ? 10 : "50%",
        transform: (focused || hasVal) ? "translateY(0) scale(0.82)" : "translateY(-50%) scale(1)",
        transformOrigin: "left top",
        fontWeight: 700, fontSize: 14,
        color: focused ? T.emerald : T.muted,
        pointerEvents: "none",
        transition: "all 0.2s cubic-bezier(.16,1,.3,1)",
        letterSpacing: "0.01em", zIndex: 2,
      }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        required={required}
        style={{
          width: "100%",
          padding: hasVal || focused ? "26px 18px 10px" : "18px 18px",
          paddingRight: rightSlot ? 52 : 18,
          border: `2px solid ${focused ? T.emerald : "rgba(45,206,122,0.22)"}`,
          borderRadius: 18,
          background: focused ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 15, fontWeight: 500,
          color: T.deep, outline: "none",
          backdropFilter: "blur(8px)",
          transition: "all 0.22s ease",
          boxShadow: focused
            ? `0 0 0 4px rgba(45,206,122,0.12), inset 0 2px 6px rgba(7,107,60,0.04)`
            : "inset 0 2px 6px rgba(7,107,60,0.03)",
          caretColor: T.emerald,
        }}
      />
      {rightSlot && (
        <div style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 4,
        }}>{rightSlot}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC SUBMIT BUTTON
───────────────────────────────────────────────────────────────────────────── */
function SubmitButton({ loading, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3 });
  }, []);

  return (
    <button ref={ref} type="submit" disabled={loading}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setHov(false); }}
      style={{
        width: "100%", padding: "16px 24px", border: "none", borderRadius: 18,
        background: loading
          ? "rgba(45,206,122,0.5)"
          : hov
            ? "linear-gradient(135deg,#0ea55e,#076b3c)"
            : "linear-gradient(135deg,#2dce7a,#0ea55e)",
        color: "white", fontFamily: "'DM Sans',sans-serif",
        fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
        transform: hov && !loading ? `translate(${pos.x}px,${pos.y}px) scale(1.03)` : "translate(0,0) scale(1)",
        transition: "transform 0.08s ease, box-shadow 0.2s ease, background 0.2s ease",
        boxShadow: hov && !loading
          ? "0 20px 56px rgba(14,165,94,0.42), 0 4px 16px rgba(14,165,94,0.28), inset 0 1px 0 rgba(255,255,255,0.25)"
          : "0 8px 28px rgba(14,165,94,0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        letterSpacing: "0.01em",
      }}>
      {children}
    </button>
  );
}



/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      if (data.requiresOTP) {
        navigate("/verify-otp", { state: { userId: data.userId, email: form.email } });
        toast("OTP sent to your email 📧");
      } else {
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}! 🎉`);
        const paths = { issuer: "/issuer/dashboard", verifier: "/verifier/dashboard", user: "/dashboard" };
        navigate(paths[data.user.role] || "/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(170deg,#ffffff 0%,#f7fdf9 12%,#edfaf3 28%,#d4f5e2 55%,#a8edca 80%,#4dd99a 100%)`,
      fontFamily: "'DM Sans',system-ui,sans-serif",
      display: "flex", alignItems: "stretch",
      position: "relative", overflow: "hidden",
    }}>

      {/* ── Global CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-3%,4%) scale(1.06)} 66%{transform:translate(3%,-2%) scale(0.96)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(4%,-3%) scale(1.08)} 70%{transform:translate(-2%,5%) scale(0.94)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-5%,3%)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(45,206,122,0.5)} 70%{box-shadow:0 0 0 12px rgba(45,206,122,0)} 100%{box-shadow:0 0 0 0 rgba(45,206,122,0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .shimmer-text {
          background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .form-animate { animation:fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
        .form-animate-2 { animation:fadeUp 0.7s 0.1s cubic-bezier(.16,1,.3,1) both; }
        .form-animate-3 { animation:fadeUp 0.7s 0.2s cubic-bezier(.16,1,.3,1) both; }
        .form-animate-4 { animation:fadeUp 0.7s 0.3s cubic-bezier(.16,1,.3,1) both; }
        .form-animate-5 { animation:fadeUp 0.7s 0.4s cubic-bezier(.16,1,.3,1) both; }

        .divider-link {
          color:#5a7d6a; font-size:14px; font-weight:600;
          text-decoration:none; transition:color 0.18s;
        }
        .divider-link:hover { color:#076b3c; }

        @media (max-width: 900px) {
          .left-panel { display:none !important; }
          .right-panel { width:100% !important; padding:40px 24px !important; }
        }
      `}</style>

      <MorphOrbs />

      {/* ── LEFT PANEL — decorative brand panel ─────────────────────────── */}
      <div className="left-panel" style={{
        width: "45%", position: "relative", zIndex: 1,
        background: "linear-gradient(145deg,#076b3c 0%,#0ea55e 45%,#2dce7a 100%)",
        display: "flex", flexDirection: "column",
        padding: "52px 48px",
        overflow: "hidden",
      }}>
        {/* Decorative rings */}
        {[["-80px", "-80px", 340, 0.09], ["-40px", "-40px", 220, 0.14], [null, "10%", "18%", "10%", 200, 0.07]].slice(0, 2).map(([t, r, s, o], i) => (
          <div key={i} style={{
            position: "absolute", top: t, right: r, width: s, height: s,
            borderRadius: "50%", border: `1px solid rgba(255,255,255,${o})`, pointerEvents: "none",
          }} />
        ))}
        <div style={{
          position: "absolute", bottom: "-10%", left: "-10%", width: "50%", height: "50%",
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "55%",
          fontSize: 160, opacity: 0.04, color: "white", lineHeight: 1,
          transform: "translateY(-50%)", userSelect: "none", fontWeight: 800
        }}>✦</div>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", marginBottom: "auto" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 15,
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "white", fontWeight: 800,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}>✦</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 18, color: "white", lineHeight: 1.1, letterSpacing: "-0.02em" }}>TrustBridge</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em" }}>CREDENTIAL PLATFORM</p>
          </div>
        </Link>

        {/* Center content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 20 }}>
          <p style={{
            fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18
          }}>WELCOME BACK</p>

          <h2 style={{
            fontWeight: 800, fontSize: "clamp(32px,3.5vw,52px)", color: "white",
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24
          }}>
            Your trust.<br />
            Your credentials.<br />
            <span style={{ color: "rgba(168,237,202,0.9)" }}>Your platform.</span>
          </h2>

          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, maxWidth: 340, fontWeight: 400 }}>
            Sign in to access your credential wallet, manage your DigiLocker vault,
            and interact with the TrustBridge ecosystem.
          </p>

          {/* Trust pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
            {[["🔐", "SHA-256 Secured"], ["🤖", "AI Powered"], ["📡", "Live Radar"], ["📱", "DigiLocker"]].map(([e, l]) => (
              <div key={l} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 100,
                background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontSize: 13 }}>{e}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* ── RIGHT PANEL — login form ──────────────────────────────────────── */}
      <div className="right-panel" style={{
        flex: 1, position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "52px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Mobile logo (hidden on desktop) */}
          <div style={{ display: "none" }} className="mobile-logo">
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 36 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: "linear-gradient(145deg,#2dce7a,#076b3c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "white", fontWeight: 800
              }}>✦</div>
              <span style={{ fontWeight: 800, fontSize: 17, color: T.deep }}>TrustBridge</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="form-animate" style={{ marginBottom: 36 }}>
            <p style={{
              fontSize: 12, fontWeight: 800, color: T.emerald, letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 12
            }}>SIGN IN</p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(30px,3.5vw,46px)", color: T.deep,
              letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 10
            }}>
              Welcome{" "}
              <span className="shimmer-text">back.</span>
            </h1>
            <p style={{ fontSize: 15, color: T.muted, fontWeight: 400, lineHeight: 1.6 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{
                fontWeight: 700, color: T.emerald, textDecoration: "none",
                transition: "color 0.18s"
              }}
                onMouseEnter={e => e.target.style.color = T.forest}
                onMouseLeave={e => e.target.style.color = T.emerald}>
                Create one free →
              </Link>
            </p>
          </div>

          {/* Form card */}
          <TiltCard>
            <form onSubmit={handleSubmit} style={{ padding: "36px 32px" }}>

              {/* Top gradient bar */}
              <div style={{
                height: 4, borderRadius: 100, marginBottom: 32,
                background: "linear-gradient(90deg,#2dce7a,#0ea55e,#076b3c)"
              }} />

              <div className="form-animate-2" style={{ marginBottom: 20 }}>
                <FloatInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-animate-3" style={{ marginBottom: 14 }}>
                <FloatInput
                  label="Password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  rightSlot={
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        padding: 4, display: "flex", alignItems: "center",
                        color: showPw ? T.emerald : T.muted,
                        transition: "color 0.18s",
                        fontSize: 18, lineHeight: 1,
                      }}>
                      {showPw ? "🙈" : "👁️"}
                    </button>
                  }
                />
              </div>

              {/* Forgot password */}
              <div className="form-animate-3" style={{ textAlign: "right", marginBottom: 28 }}>
                <Link to="/" className="divider-link" style={{ fontSize: 13 }}>
                  Forgot password?
                </Link>
              </div>

              <div className="form-animate-4">
                <SubmitButton loading={loading}>
                  {loading
                    ? <>
                      <span style={{
                        display: "inline-block", animation: "spin 0.8s linear infinite",
                        width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)",
                        borderTopColor: "white", borderRadius: "50%"
                      }} />
                      Signing you in…
                    </>
                    : <>Sign In <span style={{ fontSize: 18 }}>→</span></>
                  }
                </SubmitButton>
              </div>

              {/* Divider */}
              <div className="form-animate-5" style={{
                display: "flex", alignItems: "center", gap: 14, margin: "24px 0",
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(45,206,122,0.18)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.06em" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "rgba(45,206,122,0.18)" }} />
              </div>

              {/* Public verify */}
              <div className="form-animate-5" style={{ textAlign: "center" }}>
                <Link to="/verify" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 14,
                  background: "rgba(212,245,226,0.5)", border: "1.5px solid rgba(45,206,122,0.22)",
                  fontWeight: 700, fontSize: 14, color: T.forest,
                  textDecoration: "none", backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,245,226,0.8)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(45,206,122,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,245,226,0.5)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  🔍 Verify a Credential (Public)
                </Link>
              </div>
            </form>
          </TiltCard>

          {/* Footer links */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[["← Home", "/"], ["About", "/about"], ["Live Radar", "/radar"]].map(([l, to]) => (
              <Link key={to} to={to} className="divider-link" style={{ fontSize: 13 }}>{l}</Link>
            ))}
          </div>

          {/* 2FA hint */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 100,
              background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(45,206,122,0.2)",
              backdropFilter: "blur(8px)",
            }}>
              <span style={{ fontSize: 14 }}>🔐</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>
                2FA enabled? You'll receive an OTP after sign-in.
              </span>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:900px) {
          .mobile-logo { display:flex !important; }
        }
      `}</style>
    </div>
  );
}
