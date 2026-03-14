/**
 * TrustBridge — Register Page
 * Focused: 3 role cards + minimal form. No distractions.
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
        position: "absolute", top: "35%", left: "25%",
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
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.012)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "20px 28px 56px rgba(7,107,60,0.16), 0 4px 16px rgba(7,107,60,0.09)"
          : "8px 14px 36px rgba(7,107,60,0.1), 0 2px 8px rgba(7,107,60,0.05)",
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
   FLOAT LABEL INPUT
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
        name={name} type={type} value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        required={required}
        style={{
          width: "100%",
          padding: (hasVal || focused) ? "26px 18px 10px" : "18px 18px",
          paddingRight: rightSlot ? 52 : 18,
          border: `2px solid ${focused ? T.emerald : "rgba(45,206,122,0.22)"}`,
          borderRadius: 18,
          background: focused ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 15, fontWeight: 500, color: T.deep,
          outline: "none", backdropFilter: "blur(8px)",
          transition: "all 0.22s ease",
          boxShadow: focused
            ? "0 0 0 4px rgba(45,206,122,0.12), inset 0 2px 6px rgba(7,107,60,0.04)"
            : "inset 0 2px 6px rgba(7,107,60,0.03)",
          caretColor: T.emerald,
        }}
      />
      {rightSlot && (
        <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 4 }}>
          {rightSlot}
        </div>
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
        background: loading ? "rgba(45,206,122,0.5)"
          : hov ? "linear-gradient(135deg,#0ea55e,#076b3c)"
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
   ROLE DATA
───────────────────────────────────────────────────────────────────────────── */
const ROLES = [
  {
    value: "user",
    emoji: "👤",
    label: "Individual",
    desc: "Own & share your credentials",
    accent: "#2dce7a",
    shadow: "rgba(45,206,122,0.22)",
    gradient: "linear-gradient(135deg,#2dce7a,#0ea55e)",
  },
  {
    value: "issuer",
    emoji: "🏛️",
    label: "Issuer",
    desc: "Verify & issue credentials",
    accent: "#3b82f6",
    shadow: "rgba(59,130,246,0.22)",
    gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  },
  {
    value: "verifier",
    emoji: "🔍",
    label: "Verifier",
    desc: "Verify third-party credentials",
    accent: "#8b5cf6",
    shadow: "rgba(139,92,246,0.22)",
    gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", organization: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectRole = (role) => setForm({ ...form, role, organization: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      toast.success(`Welcome to TrustBridge, ${data.user.name}! 🎉`);
      const paths = { issuer: "/issuer/dashboard", verifier: "/verifier/dashboard", user: "/dashboard" };
      navigate(paths[data.user.role] || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLES.find(r => r.value === form.role);
  const needsOrg = form.role === "issuer" || form.role === "verifier";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg,#ffffff 0%,#f7fdf9 12%,#edfaf3 28%,#d4f5e2 55%,#a8edca 80%,#4dd99a 100%)",
      fontFamily: "'DM Sans',system-ui,sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", padding: "40px 24px",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-3%,4%) scale(1.06)} 66%{transform:translate(3%,-2%) scale(0.96)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(4%,-3%) scale(1.08)} 70%{transform:translate(-2%,5%) scale(0.94)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-5%,3%)} }

        @keyframes shimmer {
          0%  { background-position:200% center; }
          100%{ background-position:-200% center; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse-ring {
          0%  { box-shadow:0 0 0 0 rgba(45,206,122,0.5); }
          70% { box-shadow:0 0 0 12px rgba(45,206,122,0); }
          100%{ box-shadow:0 0 0 0 rgba(45,206,122,0); }
        }
        @keyframes slideIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .shimmer-text {
          background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 4s linear infinite;
        }

        .fa1 { animation:fadeUp 0.65s cubic-bezier(.16,1,.3,1) both; }
        .fa2 { animation:fadeUp 0.65s 0.08s cubic-bezier(.16,1,.3,1) both; }
        .fa3 { animation:fadeUp 0.65s 0.16s cubic-bezier(.16,1,.3,1) both; }
        .fa4 { animation:fadeUp 0.65s 0.24s cubic-bezier(.16,1,.3,1) both; }
        .fa5 { animation:fadeUp 0.65s 0.32s cubic-bezier(.16,1,.3,1) both; }
        .fa6 { animation:fadeUp 0.65s 0.40s cubic-bezier(.16,1,.3,1) both; }

        .role-card-btn {
          flex:1; padding:20px 16px;
          border-radius:22px; border:2px solid transparent;
          cursor:pointer; text-align:center;
          background:rgba(255,255,255,0.65);
          backdrop-filter:blur(14px);
          transition:all 0.22s cubic-bezier(.16,1,.3,1);
          position:relative; overflow:hidden;
        }
        .role-card-btn:hover {
          transform:translateY(-4px);
        }

        .footer-link {
          font-size:13px; font-weight:600; color:#5a7d6a;
          text-decoration:none; transition:color 0.18s;
        }
        .footer-link:hover { color:#076b3c; }

        .org-slide {
          animation:slideIn 0.28s cubic-bezier(.16,1,.3,1) both;
        }
      `}</style>

      <MorphOrbs />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 520 }}>

        {/* ── Logo ────────────────────────────────────────────────────────── */}
        <div className="fa1" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: 32 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "linear-gradient(145deg,#2dce7a,#076b3c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: "white", fontWeight: 800,
              boxShadow: "0 8px 20px rgba(45,206,122,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}>✦</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 18, color: T.deep, lineHeight: 1.1, letterSpacing: "-0.02em" }}>TrustBridge</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.emerald, letterSpacing: "0.1em" }}>CREDENTIAL PLATFORM</p>
            </div>
          </Link>
        </div>

        {/* ── Heading ─────────────────────────────────────────────────────── */}
        <div className="fa2" style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontWeight: 800, fontSize: "clamp(30px,4vw,44px)", color: T.deep,
            letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 10,
          }}>
            Create your{" "}
            <span className="shimmer-text">account.</span>
          </h1>
          <p style={{ fontSize: 15, color: T.muted, fontWeight: 400 }}>
            Already have one?{" "}
            <Link to="/login" style={{ fontWeight: 700, color: T.emerald, textDecoration: "none" }}
              onMouseEnter={e => e.target.style.color = T.forest}
              onMouseLeave={e => e.target.style.color = T.emerald}>
              Sign in →
            </Link>
          </p>
        </div>

        {/* ── Main card ───────────────────────────────────────────────────── */}
        <TiltCard>
          <div style={{ padding: "32px 32px 36px" }}>

            {/* Top gradient bar */}
            <div style={{
              height: 4, borderRadius: 100, marginBottom: 30,
              background: activeRole
                ? activeRole.gradient
                : "linear-gradient(90deg,#2dce7a,#0ea55e,#076b3c)",
              transition: "background 0.4s ease",
            }} />

            {/* ── ROLE SELECTOR ─────────────────────────────────────────── */}
            <div className="fa3" style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 11.5, fontWeight: 800, color: T.muted,
                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12
              }}>
                I am a...
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {ROLES.map(({ value, emoji, label, desc, accent, shadow, gradient }) => {
                  const selected = form.role === value;
                  return (
                    <button key={value} type="button"
                      onClick={() => selectRole(value)}
                      className="role-card-btn"
                      style={{
                        borderColor: selected ? accent : "rgba(255,255,255,0.5)",
                        background: selected
                          ? `linear-gradient(145deg, ${accent}18, ${accent}08)`
                          : "rgba(255,255,255,0.65)",
                        boxShadow: selected
                          ? `0 8px 28px ${shadow}, inset 0 1px 0 rgba(255,255,255,0.7)`
                          : "0 2px 10px rgba(7,107,60,0.06)",
                        transform: selected ? "translateY(-4px)" : "translateY(0)",
                      }}>

                      {/* Selected indicator dot */}
                      {selected && (
                        <div style={{
                          position: "absolute", top: 10, right: 10,
                          width: 8, height: 8, borderRadius: "50%",
                          background: accent,
                          boxShadow: `0 0 0 3px ${accent}33`,
                          animation: "pulse-ring 2s infinite",
                        }} />
                      )}

                      <div style={{
                        width: 44, height: 44, borderRadius: 14, margin: "0 auto 10px",
                        background: selected ? gradient : "rgba(212,245,226,0.6)",
                        border: selected ? "none" : "1px solid rgba(45,206,122,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22,
                        boxShadow: selected ? `0 6px 18px ${shadow}` : "none",
                        transition: "all 0.22s ease",
                      }}>{emoji}</div>

                      <p style={{
                        fontWeight: 800, fontSize: 14, lineHeight: 1.2, marginBottom: 4,
                        color: selected ? T.deep : T.muted,
                        transition: "color 0.2s",
                      }}>{label}</p>

                      <p style={{
                        fontSize: 11.5, lineHeight: 1.4,
                        color: selected ? T.muted : "#8aaa98",
                        transition: "color 0.2s",
                      }}>{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── FORM FIELDS ───────────────────────────────────────────── */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div className="fa4">
                  <FloatInput label="Full Name" name="name" value={form.name}
                    onChange={handleChange} placeholder="John Doe" required />
                </div>

                {/* Org field — only for issuer / verifier */}
                {needsOrg && (
                  <div className="org-slide">
                    <FloatInput
                      label={form.role === "issuer" ? "Institution Name" : "Organization Name"}
                      name="organization" value={form.organization}
                      onChange={handleChange}
                      placeholder={form.role === "issuer" ? "e.g. University of Mumbai" : "e.g. TechCorp HR"}
                      required
                    />
                  </div>
                )}

                <div className="fa4">
                  <FloatInput label="Email Address" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@example.com" required />
                </div>

                <div className="fa5">
                  <FloatInput
                    label="Password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    required
                    rightSlot={
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: 4, display: "flex", alignItems: "center",
                          color: showPw ? T.emerald : T.muted,
                          transition: "color 0.18s", fontSize: 18, lineHeight: 1
                        }}>
                        {showPw ? "🙈" : "👁️"}
                      </button>
                    }
                  />
                </div>

                <div className="fa6" style={{ paddingTop: 4 }}>
                  <SubmitButton loading={loading}>
                    {loading
                      ? <>
                        <span style={{
                          display: "inline-block", animation: "spin 0.8s linear infinite",
                          width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)",
                          borderTopColor: "white", borderRadius: "50%",
                        }} />
                        Creating account…
                      </>
                      : <>
                        Create Account
                        <span style={{ fontSize: 18 }}>→</span>
                      </>
                    }
                  </SubmitButton>
                </div>
              </div>
            </form>
          </div>
        </TiltCard>

        {/* ── Footer links ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
          {[["← Home", "/"], ["About", "/about"], ["Verify", "/verify"]].map(([l, to]) => (
            <Link key={to} to={to} className="footer-link">{l}</Link>
          ))}
        </div>

      </div>
    </div>
  );
}
