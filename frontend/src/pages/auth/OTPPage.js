/**
 * TrustBridge — OTP Verification Page
 * Professional, focused, secure-feeling.
 * Split layout: brand panel left · OTP entry right
 * Full functionality: 6-digit input, paste, countdown, resend, 2FA flow
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.08)",
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
        position: "absolute", top: "35%", left: "20%",
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
    setTilt({ rx: (y - 0.5) * -8, ry: (x - 0.5) * 8, sx: x * 100, sy: y * 100 });
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
          : "8px 14px 36px rgba(7,107,60,0.10), 0 2px 8px rgba(7,107,60,0.05)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 32, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.16) 0%, transparent 58%)`,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CIRCULAR COUNTDOWN TIMER
───────────────────────────────────────────────────────────────────────────── */
function CountdownRing({ total, remaining }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const pct = remaining / total;
  const dash = pct * circ;
  const color = remaining > 30 ? T.emerald : remaining > 10 ? "#f59e0b" : T.error;

  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={32} cy={32} r={r} fill="none"
          stroke="rgba(45,206,122,0.15)" strokeWidth={4} />
        {/* Progress */}
        <circle cx={32} cy={32} r={r} fill="none"
          stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s ease" }}
        />
      </svg>
      {/* Center number */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontWeight: 800, fontSize: 16, lineHeight: 1,
          color, fontFamily: "'DM Sans',sans-serif",
          transition: "color 0.5s ease",
        }}>{remaining}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: "0.04em" }}>SEC</span>
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC VERIFY BUTTON
───────────────────────────────────────────────────────────────────────────── */
function VerifyButton({ loading, disabled, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  }, []);

  const isDisabled = loading || disabled;

  return (
    <button ref={ref} type="submit" disabled={isDisabled}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setHov(false); }}
      style={{
        width: "100%", padding: "16px 24px",
        border: "none", borderRadius: 18,
        background: isDisabled
          ? "rgba(45,206,122,0.4)"
          : hov
            ? "linear-gradient(135deg,#0ea55e,#076b3c)"
            : "linear-gradient(135deg,#2dce7a,#0ea55e)",
        color: "white", fontFamily: "'DM Sans',sans-serif",
        fontWeight: 800, fontSize: 16,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transform: hov && !isDisabled
          ? `translate(${pos.x}px,${pos.y}px) scale(1.03)`
          : "translate(0,0) scale(1)",
        transition: "transform 0.08s ease, box-shadow 0.2s ease, background 0.2s ease",
        boxShadow: hov && !isDisabled
          ? "0 20px 56px rgba(14,165,94,0.42), 0 4px 16px rgba(14,165,94,0.28), inset 0 1px 0 rgba(255,255,255,0.25)"
          : isDisabled
            ? "none"
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
const OTP_TOTAL = 60;

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusIdx, setFocusIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(OTP_TOTAL);
  const [hasError, setHasError] = useState(false);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const { userId, email } = location.state || {};

  /* Redirect if no userId */
  useEffect(() => {
    if (!userId) navigate("/login");
    else inputRefs.current[0]?.focus();
  }, [userId, navigate]);

  /* Countdown timer */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Digit input handler ──────────────────────────────────────────────── */
  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    setHasError(false);
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) {
      inputRefs.current[i + 1]?.focus();
      setFocusIdx(i + 1);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      setHasError(false);
      if (!otp[i] && i > 0) {
        const next = [...otp]; next[i - 1] = "";
        setOtp(next);
        inputRefs.current[i - 1]?.focus();
        setFocusIdx(i - 1);
      } else {
        const next = [...otp]; next[i] = "";
        setOtp(next);
      }
    }
    if (e.key === "ArrowLeft" && i > 0) { inputRefs.current[i - 1]?.focus(); setFocusIdx(i - 1); }
    if (e.key === "ArrowRight" && i < 5) { inputRefs.current[i + 1]?.focus(); setFocusIdx(i + 1); }
  };

  /* ── Paste handler ────────────────────────────────────────────────────── */
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      setHasError(false);
      inputRefs.current[5]?.focus();
      setFocusIdx(5);
    }
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length < 6) { setHasError(true); toast.error("Enter all 6 digits"); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ userId, otp: otpStr });
      setVerified(true);

      /* Brief success pause before redirect */
      setTimeout(() => {
        login(data.token, data.user);
        toast.success(`Verified! Welcome back, ${data.user.name} 🎉`);
        const paths = { issuer: "/issuer/dashboard", verifier: "/verifier/dashboard", user: "/dashboard" };
        navigate(paths[data.user.role] || "/dashboard");
      }, 900);
    } catch (err) {
      setHasError(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setFocusIdx(0);
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend ───────────────────────────────────────────────────────────── */
  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ userId });
      toast.success("New OTP sent to your email");
      setCountdown(OTP_TOTAL);
      setOtp(["", "", "", "", "", ""]);
      setHasError(false);
      inputRefs.current[0]?.focus();
      setFocusIdx(0);
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  /* ── Auto-submit when all 6 filled ───────────────────────────────────── */
  useEffect(() => {
    if (otp.every(d => d !== "") && !loading && !verified) {
      const form = document.getElementById("otp-form");
      if (form) form.requestSubmit?.() || form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
  }, [otp]);

  const otpComplete = otp.every(d => d !== "");
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(2, b.length)) + c)
    : "your email";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg,#ffffff 0%,#f7fdf9 12%,#edfaf3 28%,#d4f5e2 55%,#a8edca 80%,#4dd99a 100%)",
      fontFamily: "'DM Sans',system-ui,sans-serif",
      display: "flex", alignItems: "stretch",
      position: "relative", overflow: "hidden",
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
        @keyframes blink {
          0%,100%{ opacity:1; } 50%{ opacity:0; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shake {
          0%,100%{ transform:translateX(0); }
          15%    { transform:translateX(-8px); }
          30%    { transform:translateX(8px); }
          45%    { transform:translateX(-6px); }
          60%    { transform:translateX(6px); }
          75%    { transform:translateX(-3px); }
          90%    { transform:translateX(3px); }
        }
        @keyframes successPop {
          0%  { transform:scale(0.5); opacity:0; }
          70% { transform:scale(1.15); }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes pulse-ring {
          0%  { box-shadow:0 0 0 0 rgba(45,206,122,0.5); }
          70% { box-shadow:0 0 0 12px rgba(45,206,122,0); }
          100%{ box-shadow:0 0 0 0 rgba(45,206,122,0); }
        }

        .shimmer-text {
          background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 4s linear infinite;
        }

        .fa1 { animation:fadeUp 0.65s cubic-bezier(.16,1,.3,1) both; }
        .fa2 { animation:fadeUp 0.65s 0.1s cubic-bezier(.16,1,.3,1) both; }
        .fa3 { animation:fadeUp 0.65s 0.2s cubic-bezier(.16,1,.3,1) both; }
        .fa4 { animation:fadeUp 0.65s 0.3s cubic-bezier(.16,1,.3,1) both; }

        .digits-shake { animation:shake 0.45s ease both; }

        .footer-link {
          font-size:13px; font-weight:600; color:#5a7d6a;
          text-decoration:none; transition:color 0.18s;
        }
        .footer-link:hover { color:#076b3c; }

        @media (max-width:900px) {
          .left-panel { display:none !important; }
          .right-panel { width:100% !important; padding:40px 24px !important; }
        }
      `}</style>

      <MorphOrbs />

      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="left-panel" style={{
        width: "44%", position: "relative", zIndex: 1,
        background: "linear-gradient(145deg,#076b3c 0%,#0ea55e 45%,#2dce7a 100%)",
        display: "flex", flexDirection: "column", padding: "52px 48px",
        overflow: "hidden",
      }}>
        {/* Decorative rings */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px", width: 340, height: 340,
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.09)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: "-40px", right: "-40px", width: 220, height: 220,
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)", pointerEvents: "none"
        }} />
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
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{
            fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18
          }}>TWO-FACTOR AUTH</p>

          <h2 style={{
            fontWeight: 800, fontSize: "clamp(28px,3vw,46px)", color: "white",
            letterSpacing: "-0.03em", lineHeight: 1.12, marginBottom: 24
          }}>
            One last step<br />
            to keep you<br />
            <span style={{ color: "rgba(168,237,202,0.9)" }}>secure.</span>
          </h2>

          <p style={{ fontSize: 15.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, maxWidth: 320, fontWeight: 400 }}>
            We sent a 6-digit verification code to your email. Enter it to complete your sign-in.
          </p>

          {/* Security info boxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 36 }}>
            {[
              { icon: "🔐", title: "End-to-end secured", body: "Your session is protected with JWT and bcrypt encryption." },
              { icon: "⏱️", title: "Code expires in 10 min", body: "For your safety, OTPs are single-use and time-limited." },
              { icon: "📧", title: "Check your inbox", body: "Look for an email from TrustBridge. Check spam if needed." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 16px", borderRadius: 16,
                background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 3 }}>{title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.5 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div className="right-panel" style={{
        flex: 1, position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "52px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* ── Heading ─────────────────────────────────────────────────── */}
          <div className="fa1" style={{ marginBottom: 32 }}>
            <p style={{
              fontSize: 12, fontWeight: 800, color: T.emerald,
              letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12
            }}>VERIFICATION</p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(28px,3.5vw,42px)", color: T.deep,
              letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 10
            }}>
              Enter your{" "}
              <span className="shimmer-text">OTP.</span>
            </h1>
            <p style={{ fontSize: 14.5, color: T.muted, fontWeight: 400, lineHeight: 1.6 }}>
              Code sent to{" "}
              <span style={{ fontWeight: 700, color: T.forest }}>{maskedEmail}</span>
            </p>
          </div>

          {/* ── OTP Card ────────────────────────────────────────────────── */}
          <TiltCard>
            <div style={{ padding: "36px 32px" }}>

              {/* Top bar */}
              <div style={{
                height: 4, borderRadius: 100, marginBottom: 32,
                background: "linear-gradient(90deg,#2dce7a,#0ea55e,#076b3c)"
              }} />

              {/* Success state */}
              {verified ? (
                <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
                    background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32,
                    boxShadow: "0 8px 32px rgba(45,206,122,0.4)",
                    animation: "successPop 0.45s cubic-bezier(.16,1,.3,1) both",
                  }}>✓</div>
                  <p style={{ fontWeight: 800, fontSize: 20, color: T.forest, marginBottom: 6 }}>Verified!</p>
                  <p style={{ fontSize: 14, color: T.muted }}>Redirecting you now…</p>
                </div>
              ) : (
                <form id="otp-form" onSubmit={handleSubmit}>

                  {/* Timer + instruction row */}
                  <div className="fa2" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28,
                  }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13.5, color: T.deep, marginBottom: 4 }}>
                        Enter 6-digit code
                      </p>
                      <p style={{ fontSize: 12.5, color: T.muted }}>
                        Paste or type each digit
                      </p>
                    </div>
                    <CountdownRing total={OTP_TOTAL} remaining={countdown} />
                  </div>

                  {/* ── 6 digit boxes ─────────────────────────────────── */}
                  <div className={`fa3 ${hasError ? "digits-shake" : ""}`}
                    style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 10 }}
                    onPaste={handlePaste}>
                    {otp.map((digit, i) => {
                      const filled = digit !== "";
                      const focused = focusIdx === i;

                      let borderColor = "rgba(45,206,122,0.22)";
                      let background = "rgba(255,255,255,0.7)";
                      let boxShadow = "none";
                      let scaleStyle = "scale(1)";

                      if (hasError) {
                        borderColor = T.error;
                        background = "rgba(239,68,68,0.06)";
                        boxShadow = "0 0 0 4px rgba(239,68,68,0.1)";
                      } else if (focused) {
                        borderColor = T.emerald;
                        background = "rgba(255,255,255,0.95)";
                        boxShadow = "0 0 0 4px rgba(45,206,122,0.14), 0 4px 16px rgba(45,206,122,0.12)";
                        scaleStyle = "scale(1.08)";
                      } else if (filled) {
                        borderColor = T.jade;
                        background = "rgba(212,245,226,0.6)";
                        boxShadow = "0 4px 14px rgba(45,206,122,0.14)";
                        scaleStyle = "scale(1.04)";
                      }

                      return (
                        <input
                          key={i}
                          ref={el => inputRefs.current[i] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleChange(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          onFocus={() => { setFocusIdx(i); setHasError(false); }}
                          onBlur={() => setFocusIdx(-1)}
                          style={{
                            width: 56, height: 64,
                            border: `2.5px solid ${borderColor}`,
                            borderRadius: 18,
                            background,
                            boxShadow,
                            transform: scaleStyle,
                            textAlign: "center",
                            fontFamily: "'DM Sans',sans-serif",
                            fontWeight: 800,
                            fontSize: 26,
                            color: hasError ? T.error : filled ? T.forest : T.muted,
                            outline: "none",
                            cursor: "text",
                            caretColor: "transparent",
                            transition: "all 0.2s cubic-bezier(.16,1,.3,1)",
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Error message */}
                  {hasError && (
                    <p style={{
                      textAlign: "center", fontSize: 13, fontWeight: 600,
                      color: T.error, marginBottom: 16, animation: "fadeUp 0.25s ease both"
                    }}>
                      ✕ Invalid or expired code. Please try again.
                    </p>
                  )}

                  {/* Verify button */}
                  <div className="fa4" style={{ marginTop: 24 }}>
                    <VerifyButton loading={loading} disabled={!otpComplete}>
                      {loading
                        ? <>
                          <span style={{
                            display: "inline-block", animation: "spin 0.8s linear infinite",
                            width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)",
                            borderTopColor: "white", borderRadius: "50%",
                          }} />
                          Verifying…
                        </>
                        : <>
                          Verify Code
                          <span style={{ fontSize: 18 }}>→</span>
                        </>
                      }
                    </VerifyButton>
                  </div>

                  {/* Resend section */}
                  <div style={{ marginTop: 24, textAlign: "center" }}>
                    {countdown > 0 ? (
                      <p style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>
                        Resend code in{" "}
                        <span style={{ fontWeight: 800, color: countdown <= 10 ? T.error : T.forest }}>
                          {countdown}s
                        </span>
                      </p>
                    ) : (
                      <button type="button" onClick={handleResend} disabled={resending}
                        style={{
                          background: "none", border: "none", cursor: resending ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14,
                          color: resending ? T.muted : T.emerald,
                          display: "inline-flex", alignItems: "center", gap: 7,
                          transition: "color 0.18s",
                          padding: 0,
                        }}
                        onMouseEnter={e => { if (!resending) e.currentTarget.style.color = T.forest; }}
                        onMouseLeave={e => { e.currentTarget.style.color = resending ? T.muted : T.emerald; }}>
                        {resending
                          ? <>
                            <span style={{
                              display: "inline-block", animation: "spin 0.8s linear infinite",
                              width: 14, height: 14, border: "2px solid rgba(45,206,122,0.3)",
                              borderTopColor: T.emerald, borderRadius: "50%",
                            }} />
                            Sending…
                          </>
                          : <>↺ Resend OTP</>
                        }
                      </button>
                    )}
                  </div>

                </form>
              )}
            </div>
          </TiltCard>

          {/* Footer links */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
            <Link to="/login" className="footer-link">← Back to Login</Link>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/about" className="footer-link">About</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
