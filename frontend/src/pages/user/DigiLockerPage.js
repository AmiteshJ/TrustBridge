/**
 * TrustBridge — DigiLocker Vault Page
 * Full design system: tilt cards · morphing UI · full width
 * All functionality preserved: link, OTP verify, unlink, vault documents
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import { digilockerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

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
  blue: "#3b82f6",
  blueDark: "#1d4ed8",
  blueBg: "rgba(59,130,246,0.1)",
  blueBorder: "rgba(59,130,246,0.25)",
};

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
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.012)`
          : "perspective(900px) rotateX(0) rotateY(0) scale(1)",
        boxShadow: hov
          ? "14px 20px 44px rgba(7,107,60,0.14), 0 4px 14px rgba(7,107,60,0.08)"
          : "6px 8px 24px rgba(7,107,60,0.09), 0 2px 6px rgba(7,107,60,0.05)",
        ...extra,
      }}>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 26, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
        }} />
      )}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FLOAT LABEL INPUT
───────────────────────────────────────────────────────────────────────────── */
function FloatInput({ label, name, type = "text", value, onChange, placeholder, maxLength }) {
  const [focused, setFocused] = useState(false);
  const hasVal = String(value || "").length > 0;
  const lifted = focused || hasVal;

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <label style={{
        position: "absolute", left: 16,
        top: lifted ? 8 : "50%",
        transform: lifted ? "translateY(0) scale(0.8)" : "translateY(-50%) scale(1)",
        transformOrigin: "left top",
        fontWeight: 700, fontSize: 14,
        color: focused ? T.emerald : T.muted,
        pointerEvents: "none",
        transition: "all 0.2s cubic-bezier(.16,1,.3,1)",
        zIndex: 2,
      }}>{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        maxLength={maxLength}
        style={{
          width: "100%",
          padding: lifted ? "24px 16px 8px" : "16px 16px",
          border: `2px solid ${focused ? T.emerald : "rgba(45,206,122,0.22)"}`,
          borderRadius: 15,
          background: focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 15, fontWeight: 500, color: T.deep,
          outline: "none", backdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
          boxShadow: focused
            ? "0 0 0 4px rgba(45,206,122,0.12), inset 0 2px 4px rgba(7,107,60,0.04)"
            : "inset 0 2px 4px rgba(7,107,60,0.03)",
          caretColor: T.emerald,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON
───────────────────────────────────────────────────────────────────────────── */
function MagBtn({ children, onClick, disabled, variant = "solid", style: extra = {} }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  }, []);

  const isDisabled = disabled;
  const solid = {
    background: isDisabled ? "rgba(45,206,122,0.38)"
      : hov ? "linear-gradient(135deg,#0ea55e,#076b3c)"
        : "linear-gradient(135deg,#2dce7a,#0ea55e)",
    color: "white",
    boxShadow: hov && !isDisabled
      ? "0 16px 40px rgba(14,165,94,0.38), inset 0 1px 0 rgba(255,255,255,0.22)"
      : isDisabled ? "none"
        : "0 6px 22px rgba(14,165,94,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
  };
  const danger = {
    background: hov ? "rgba(239,68,68,0.14)" : "rgba(239,68,68,0.08)",
    color: "#991b1b",
    border: "1.5px solid rgba(239,68,68,0.25)",
    boxShadow: hov ? "0 6px 20px rgba(239,68,68,0.15)" : "none",
  };
  const vs = variant === "danger" ? danger : solid;

  return (
    <button ref={ref} type="button" onClick={onClick} disabled={isDisabled}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setHov(false); }}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 24px", borderRadius: 14, border: "none",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transform: hov && !isDisabled ? `translate(${pos.x}px,${pos.y}px) scale(1.03)` : "translate(0,0) scale(1)",
        transition: "transform 0.08s ease, box-shadow 0.18s ease, background 0.18s ease",
        whiteSpace: "nowrap", flexShrink: 0,
        ...vs, ...extra,
      }}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OTP DIGIT BOXES  (same pattern as OTPPage)
───────────────────────────────────────────────────────────────────────────── */
function OtpBoxes({ value, onChange }) {
  const digits = (value + "      ").slice(0, 6).split("");
  const inputRefs = useRef([]);
  const [focusIdx, setFocusIdx] = useState(-1);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const arr = value.padEnd(6, " ").split("");
    arr[i] = val.slice(-1);
    const next = arr.join("").trimEnd();
    onChange(next);
    if (val && i < 5) { inputRefs.current[i + 1]?.focus(); setFocusIdx(i + 1); }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      const arr = value.padEnd(6, " ").split("");
      if (!arr[i].trim() && i > 0) {
        arr[i - 1] = " ";
        onChange(arr.join("").trimEnd());
        inputRefs.current[i - 1]?.focus();
        setFocusIdx(i - 1);
      } else {
        arr[i] = " ";
        onChange(arr.join("").trimEnd());
      }
    }
    if (e.key === "ArrowLeft" && i > 0) { inputRefs.current[i - 1]?.focus(); setFocusIdx(i - 1); }
    if (e.key === "ArrowRight" && i < 5) { inputRefs.current[i + 1]?.focus(); setFocusIdx(i + 1); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); inputRefs.current[Math.min(pasted.length, 5)]?.focus(); }
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }} onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const digit = digits[i]?.trim() || "";
        const focused = focusIdx === i;
        return (
          <input key={i}
            ref={el => inputRefs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onFocus={() => setFocusIdx(i)}
            onBlur={() => setFocusIdx(-1)}
            style={{
              width: 52, height: 60,
              border: `2.5px solid ${focused ? T.emerald : digit ? T.jade : "rgba(45,206,122,0.22)"}`,
              borderRadius: 16,
              background: focused ? "rgba(255,255,255,0.95)" : digit ? "rgba(212,245,226,0.5)" : "rgba(255,255,255,0.7)",
              textAlign: "center",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 24,
              color: digit ? T.forest : T.muted,
              outline: "none", caretColor: "transparent",
              boxShadow: focused
                ? "0 0 0 4px rgba(45,206,122,0.14), 0 4px 14px rgba(45,206,122,0.1)"
                : digit ? "0 4px 12px rgba(45,206,122,0.12)" : "none",
              transform: focused ? "scale(1.08)" : digit ? "scale(1.04)" : "scale(1)",
              transition: "all 0.2s cubic-bezier(.16,1,.3,1)",
              cursor: "text",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOC CARD
───────────────────────────────────────────────────────────────────────────── */
function DocCard({ doc, idx }) {
  const [hov, setHov] = useState(false);
  const syncDate = new Date(doc.syncedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const EMOJIS = ["🎓", "💼", "📜", "🪪", "💰", "🏋️", "📋"];
  const emoji = EMOJIS[idx % EMOJIS.length];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px", borderRadius: 18,
      background: hov ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.6)",
      border: "1.5px solid rgba(255,255,255,0.6)",
      transition: "all 0.2s ease",
      transform: hov ? "translateX(4px)" : "translateX(0)",
      boxShadow: hov ? "6px 8px 24px rgba(7,107,60,0.1)" : "3px 4px 14px rgba(7,107,60,0.06)",
    }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: T.blueBg, border: `1px solid ${T.blueBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          boxShadow: "0 3px 10px rgba(59,130,246,0.15)",
        }}>{emoji}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontWeight: 700, fontSize: 14, color: T.deep,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3
          }}>
            {doc.title}
          </p>
          <p style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>
            {doc.issuedBy} · Synced {syncDate}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
        <span style={{
          fontSize: 11.5, fontWeight: 800, padding: "4px 12px", borderRadius: 100,
          background: "rgba(45,206,122,0.12)", color: T.forest,
          border: "1px solid rgba(45,206,122,0.22)",
          textTransform: "capitalize",
        }}>✅ {doc.status}</span>
        <a href={doc.documentUrl} target="_blank" rel="noreferrer" style={{
          fontSize: 12.5, fontWeight: 700, color: T.blue,
          textDecoration: "none", padding: "5px 12px", borderRadius: 10,
          background: T.blueBg, border: `1px solid ${T.blueBorder}`,
          transition: "all 0.18s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.blueBg; }}>
          View →
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function DigiLockerPage() {
  const { user, updateUser } = useAuth();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("idle"); // idle | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (user?.digilockerLinked) {
      digilockerAPI.getVault()
        .then(({ data }) => setVault(data.vault))
        .catch(() => { })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.digilockerLinked]);

  const initiateLink = async () => {
    if (!phone || phone.replace(/\D/g, "").length < 10) { toast.error("Enter a valid 10-digit phone number"); return; }
    setWorking(true);
    try {
      await digilockerAPI.initiateLink({ phone });
      setStep("otp");
      toast("OTP sent to your email 📱");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally { setWorking(false); }
  };

  const verifyAndLink = async () => {
    if (!otp || otp.trim().length !== 6) { toast.error("Enter the complete 6-digit OTP"); return; }
    setWorking(true);
    try {
      await digilockerAPI.verifyAndLink({ otp: otp.trim() });
      updateUser({ digilockerLinked: true });
      const { data } = await digilockerAPI.getVault();
      setVault(data.vault);
      setStep("idle");
      toast.success("DigiLocker linked successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally { setWorking(false); }
  };

  const unlink = async () => {
    if (!window.confirm("Unlink DigiLocker? Your vault data will be retained.")) return;
    setWorking(true);
    try {
      await digilockerAPI.unlink();
      updateUser({ digilockerLinked: false });
      setVault(null);
      toast("DigiLocker unlinked");
    } catch {
      toast.error("Failed to unlink");
    } finally { setWorking(false); }
  };

  const isLinked = user?.digilockerLinked;
  const docCount = vault?.documents?.length || 0;

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }
          @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes spin     { to{transform:rotate(360deg)} }
          @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
          @keyframes shimmer2 { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          @keyframes slideIn  { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

          .shimmer-text {
            background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .skel { background:linear-gradient(90deg,rgba(212,245,226,0.6) 25%,rgba(168,237,202,0.5) 50%,rgba(212,245,226,0.6) 75%);
            background-size:200% 100%; animation:shimmer2 1.4s infinite; border-radius:18px; }
          .fa1 { animation:fadeUp 0.6s cubic-bezier(.16,1,.3,1) both; }
          .fa2 { animation:fadeUp 0.6s 0.08s cubic-bezier(.16,1,.3,1) both; }
          .fa3 { animation:fadeUp 0.6s 0.16s cubic-bezier(.16,1,.3,1) both; }
          .fa4 { animation:fadeUp 0.6s 0.24s cubic-bezier(.16,1,.3,1) both; }
          .otp-section { animation:slideIn 0.3s cubic-bezier(.16,1,.3,1) both; }

          @media (max-width:900px) {
            .digi-grid { grid-template-columns:1fr !important; }
          }
        `}</style>

        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        <div className="fa1" style={{
          borderRadius: 26, padding: "28px 36px", marginBottom: 24,
          background: "linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#60a5fa 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden",
          boxShadow: "0 16px 48px rgba(59,130,246,0.28)",
        }}>
          <div style={{
            position: "absolute", top: -50, right: -50, width: 200, height: 200,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -25, right: -25, width: 130, height: 130,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.16)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "42%",
            fontSize: 100, opacity: 0.05, color: "white", transform: "translateY(-50%)", userSelect: "none"
          }}>✦</div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 20,
              background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}>📱</div>
            <div>
              <p style={{
                fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6
              }}>SECURE VAULT</p>
              <h1 style={{
                fontWeight: 800, fontSize: "clamp(20px,2.5vw,30px)", color: "white",
                letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4
              }}>
                DigiLocker Vault
              </h1>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", fontWeight: 400 }}>
                {isLinked
                  ? `${docCount} document${docCount !== 1 ? "s" : ""} synced · Account active`
                  : "Connect to sync verified credentials securely"}
              </p>
            </div>
          </div>

          {/* Status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px", borderRadius: 100,
            background: isLinked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              width: 9, height: 9, borderRadius: "50%",
              background: isLinked ? "#a8edca" : "rgba(255,255,255,0.5)",
              animation: isLinked ? "pulse 2s infinite" : "none",
            }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>
              {isLinked ? "✓ Linked & Active" : "Not Connected"}
            </span>
            {vault?.phone && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                · {vault.phone}
              </span>
            )}
          </div>
        </div>

        {/* ── TWO-COL LAYOUT ───────────────────────────────────────────── */}
        <div className="digi-grid" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>

          {/* LEFT — connection panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Connection status card */}
            <div className="fa2">
              <TiltCard>
                <div style={{ padding: "24px 24px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 20,
                    background: isLinked
                      ? "linear-gradient(90deg,#3b82f6,#1d4ed8,transparent)"
                      : "linear-gradient(90deg,#2dce7a,#0ea55e,transparent)"
                  }} />

                  <p style={{
                    fontSize: 11, fontWeight: 800, color: T.muted,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16
                  }}>
                    ACCOUNT STATUS
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 20,
                      background: isLinked ? T.blueBg : "rgba(107,114,128,0.1)",
                      border: `1.5px solid ${isLinked ? T.blueBorder : "rgba(107,114,128,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                      position: "relative",
                    }}>
                      📱
                      {isLinked && (
                        <div style={{
                          position: "absolute", bottom: -3, right: -3,
                          width: 16, height: 16, borderRadius: "50%",
                          background: T.jade, border: "2.5px solid white",
                          fontSize: 8, display: "flex", alignItems: "center",
                          justifyContent: "center", color: "white", fontWeight: 800,
                        }}>✓</div>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 16, color: T.deep, marginBottom: 3 }}>
                        DigiLocker Account
                      </p>
                      <p style={{
                        fontSize: 13, fontWeight: 600,
                        color: isLinked ? T.blue : T.muted
                      }}>
                        {isLinked ? "Linked & Active" : "Not Connected"}
                      </p>
                      {vault?.phone && (
                        <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                          📞 {vault.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats when linked */}
                  {isLinked && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {[
                        { label: "Documents", value: docCount },
                        { label: "Sync Status", value: "Active" },
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          background: "rgba(59,130,246,0.07)", borderRadius: 14,
                          padding: "10px 14px", border: `1px solid ${T.blueBorder}`,
                        }}>
                          <p style={{
                            fontSize: 10.5, fontWeight: 700, color: T.muted,
                            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3
                          }}>{label}</p>
                          <p style={{ fontSize: 16, fontWeight: 800, color: T.blueDark }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Unlink button */}
                  {isLinked && (
                    <MagBtn onClick={unlink} disabled={working} variant="danger" style={{ width: "100%" }}>
                      {working
                        ? <><div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: "2px solid rgba(153,27,27,0.4)", borderTopColor: "#991b1b",
                          animation: "spin 0.8s linear infinite"
                        }} /> Unlinking…</>
                        : "🔗 Unlink DigiLocker"
                      }
                    </MagBtn>
                  )}
                </div>
              </TiltCard>
            </div>

            {/* Connect flow — only when not linked */}
            {!isLinked && (
              <div className="fa3">
                <TiltCard>
                  <div style={{ padding: "24px 24px" }}>
                    <div style={{
                      height: 3, borderRadius: 100, marginBottom: 20,
                      background: "linear-gradient(90deg,#3b82f6,#1d4ed8,transparent)"
                    }} />

                    <p style={{
                      fontSize: 11, fontWeight: 800, color: T.muted,
                      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6
                    }}>
                      CONNECT DIGILOCKER
                    </p>
                    <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 20 }}>
                      Enter your phone number to verify and link your DigiLocker account.
                    </p>

                    {/* Step: Phone */}
                    {step === "idle" && (
                      <div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                          <FloatInput
                            label="📞 Phone Number"
                            name="phone" type="tel" value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                          />
                          <MagBtn onClick={initiateLink} disabled={working}
                            style={{ paddingLeft: 18, paddingRight: 18 }}>
                            {working
                              ? <div style={{
                                width: 16, height: 16, borderRadius: "50%",
                                border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white",
                                animation: "spin 0.8s linear infinite"
                              }} />
                              : "Send OTP →"
                            }
                          </MagBtn>
                        </div>

                        {/* Simulation note */}
                        <div style={{
                          display: "flex", alignItems: "flex-start", gap: 10,
                          padding: "11px 14px", borderRadius: 14,
                          background: "rgba(254,243,199,0.6)", border: "1.5px solid rgba(245,158,11,0.25)"
                        }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
                          <p style={{ fontSize: 12.5, color: "#a16207", lineHeight: 1.55, fontWeight: 400 }}>
                            <strong>Simulation:</strong> OTP will be sent to your registered email address (simulating SMS delivery).
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step: OTP */}
                    {step === "otp" && (
                      <div className="otp-section">
                        <div style={{
                          display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
                          padding: "11px 14px", borderRadius: 14,
                          background: "rgba(212,245,226,0.6)", border: "1.5px solid rgba(45,206,122,0.25)",
                        }}>
                          <span style={{ fontSize: 16 }}>📧</span>
                          <p style={{ fontSize: 13, color: T.forest, fontWeight: 600 }}>
                            OTP sent to your email. Check your inbox.
                          </p>
                        </div>

                        <p style={{
                          fontSize: 12, fontWeight: 700, color: T.muted,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                          textAlign: "center", marginBottom: 16
                        }}>
                          ENTER 6-DIGIT OTP
                        </p>

                        <div style={{ marginBottom: 20 }}>
                          <OtpBoxes value={otp} onChange={setOtp} />
                        </div>

                        <MagBtn onClick={verifyAndLink} disabled={working || otp.trim().length < 6}
                          style={{ width: "100%", marginBottom: 12 }}>
                          {working
                            ? <><div style={{
                              width: 16, height: 16, borderRadius: "50%",
                              border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white",
                              animation: "spin 0.8s linear infinite"
                            }} /> Verifying…</>
                            : "✓ Verify & Link"
                          }
                        </MagBtn>

                        <button onClick={() => { setStep("idle"); setOtp(""); }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600,
                            color: T.muted, display: "block", textAlign: "center", width: "100%",
                            transition: "color 0.18s"
                          }}
                          onMouseEnter={e => e.target.style.color = T.forest}
                          onMouseLeave={e => e.target.style.color = T.muted}>
                          ← Change number
                        </button>
                      </div>
                    )}
                  </div>
                </TiltCard>
              </div>
            )}

            {/* How it works card */}
            <div className="fa4">
              <TiltCard>
                <div style={{ padding: "22px 22px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 16,
                    background: "linear-gradient(90deg,#8b5cf6,#6366f1,transparent)"
                  }} />
                  <p style={{
                    fontSize: 11, fontWeight: 800, color: T.muted,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14
                  }}>
                    HOW IT WORKS
                  </p>
                  {[
                    { emoji: "🔗", title: "Connect", desc: "Link with your phone number via OTP verification" },
                    { emoji: "✅", title: "Sync", desc: "Push verified credentials directly to your vault" },
                    { emoji: "📲", title: "Access", desc: "View your documents securely anytime, anywhere" },
                  ].map(({ emoji, title, desc }) => (
                    <div key={title} style={{
                      display: "flex", gap: 12, marginBottom: 14,
                      alignItems: "flex-start"
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                        background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17
                      }}>
                        {emoji}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13.5, color: T.deep, marginBottom: 2 }}>{title}</p>
                        <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </div>
          </div>

          {/* RIGHT — vault documents */}
          <div className="fa3">
            <TiltCard style={{ height: "100%", minHeight: 400 }}>
              <div style={{ padding: "24px 24px" }}>
                <div style={{
                  height: 3, borderRadius: 100, marginBottom: 20,
                  background: "linear-gradient(90deg,#3b82f6,#1d4ed8,transparent)"
                }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <p style={{
                      fontSize: 11, fontWeight: 800, color: T.muted,
                      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4
                    }}>
                      VAULT DOCUMENTS
                    </p>
                    <h2 style={{ fontWeight: 800, fontSize: 18, color: T.deep, letterSpacing: "-0.02em" }}>
                      {isLinked ? `${docCount} Document${docCount !== 1 ? "s" : ""}` : "Not Connected"}
                    </h2>
                  </div>
                  {isLinked && (
                    <Link to="/wallet" style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 18px", borderRadius: 100,
                      background: T.blueBg, border: `1.5px solid ${T.blueBorder}`,
                      fontSize: 13, fontWeight: 700, color: T.blueDark, textDecoration: "none",
                      transition: "all 0.18s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = T.blueBg}>
                      + Sync More →
                    </Link>
                  )}
                </div>

                {/* Not linked state */}
                {!isLinked && (
                  <div style={{ textAlign: "center", padding: "60px 24px" }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 24, margin: "0 auto 18px",
                      background: T.blueBg, border: `1.5px solid ${T.blueBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32
                    }}>
                      🔒
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 16, color: T.deep, marginBottom: 8 }}>
                      Vault Not Accessible
                    </p>
                    <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, maxWidth: 300, margin: "0 auto" }}>
                      Connect your DigiLocker account using the panel on the left to access your vault.
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {isLinked && loading && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skel" style={{ height: 72 }} />)}
                  </div>
                )}

                {/* Empty vault */}
                {isLinked && !loading && docCount === 0 && (
                  <div style={{ textAlign: "center", padding: "52px 24px" }}>
                    <div style={{
                      width: 68, height: 68, borderRadius: 22, margin: "0 auto 18px",
                      background: T.blueBg, border: `1.5px solid ${T.blueBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
                    }}>
                      📂
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 16, color: T.deep, marginBottom: 8 }}>
                      Your vault is empty
                    </p>
                    <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 24 }}>
                      Go to your wallet and sync verified credentials here
                    </p>
                    <Link to="/wallet" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "11px 24px", borderRadius: 100,
                      background: `linear-gradient(135deg,${T.blue},${T.blueDark})`,
                      color: "white", fontWeight: 800, fontSize: 14, textDecoration: "none",
                      boxShadow: `0 6px 20px rgba(59,130,246,0.3)`,
                      transition: "transform 0.18s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                      Open Credential Wallet →
                    </Link>
                  </div>
                )}

                {/* Document list */}
                {isLinked && !loading && docCount > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {vault.documents.map((doc, i) => (
                      <DocCard key={i} doc={doc} idx={i} />
                    ))}
                  </div>
                )}
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
