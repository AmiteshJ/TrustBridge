/**
 * TrustBridge — Verifier Dashboard
 * Red/crimson theme · tilt cards · rich verification result · full width
 * All functionality preserved: verify by ID, result display, AI explanation
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { verifierAPI } from "../../services/api";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS — Red / Crimson theme
───────────────────────────────────────────────────────────────────────────── */
const T = {
  white: "#ffffff",
  rose: "#f43f5e",
  crimson: "#e11d48",
  ruby: "#be123c",
  deep: "#4c0519",
  ink: "#1c0a0f",
  muted: "#6b7280",
  glass: "rgba(255,255,255,0.74)",
  glassBorder: "rgba(255,255,255,0.58)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   RESULT CONFIG
───────────────────────────────────────────────────────────────────────────── */
const RESULT_CFG = {
  valid: { emoji: "✅", label: "Valid & Authentic", accent: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "#15803d", bar: "linear-gradient(90deg,#22c55e,#16a34a)" },
  invalid: { emoji: "❌", label: "Invalid Credential", accent: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", text: "#991b1b", bar: "linear-gradient(90deg,#ef4444,#dc2626)" },
  tampered: { emoji: "🚨", label: "Tampering Detected!", accent: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#991b1b", bar: "linear-gradient(90deg,#ef4444,#b91c1c)" },
  expired: { emoji: "⏰", label: "Credential Expired", accent: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", text: "#92400e", bar: "linear-gradient(90deg,#f59e0b,#d97706)" },
  revoked: { emoji: "🚫", label: "Credential Revoked", accent: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.22)", text: "#374151", bar: "linear-gradient(90deg,#6b7280,#4b5563)" },
  not_found: { emoji: "🔍", label: "Credential Not Found", accent: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.22)", text: "#374151", bar: "linear-gradient(90deg,#6b7280,#4b5563)" },
};
const getCfg = (r) => RESULT_CFG[r] || RESULT_CFG.not_found;

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
          ? "14px 20px 44px rgba(190,18,60,0.12), 0 4px 14px rgba(190,18,60,0.07)"
          : "6px 8px 24px rgba(190,18,60,0.08), 0 2px 6px rgba(190,18,60,0.04)",
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
   TRUST RING
───────────────────────────────────────────────────────────────────────────── */
function TrustRing({ score = 0, size = 80 }) {
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(190,18,60,0.15)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{
          fontWeight: 800, fontSize: 17, color, lineHeight: 1,
          fontFamily: "'DM Sans',sans-serif"
        }}>{score}%</span>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, marginTop: 2 }}>TRUST</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC VERIFY BUTTON
───────────────────────────────────────────────────────────────────────────── */
function VerifyBtn({ onClick, loading, disabled }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const isDisabled = loading || disabled;

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  }, []);

  return (
    <button ref={ref} onClick={onClick} disabled={isDisabled}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setHov(false); }}
      style={{
        padding: "14px 32px", borderRadius: 16, border: "none", flexShrink: 0,
        background: isDisabled ? "rgba(228,29,72,0.38)"
          : hov ? "linear-gradient(135deg,#be123c,#4c0519)"
            : "linear-gradient(135deg,#f43f5e,#e11d48)",
        color: "white", fontFamily: "'DM Sans',sans-serif",
        fontWeight: 800, fontSize: 15,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transform: hov && !isDisabled ? `translate(${pos.x}px,${pos.y}px) scale(1.04)` : "translate(0,0) scale(1)",
        transition: "transform 0.08s ease, box-shadow 0.2s ease, background 0.2s ease",
        boxShadow: hov && !isDisabled
          ? "0 18px 48px rgba(228,29,72,0.4), inset 0 1px 0 rgba(255,255,255,0.22)"
          : isDisabled ? "none"
            : "0 8px 28px rgba(228,29,72,0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
      }}>
      {loading
        ? <><Spinner />Verifying…</>
        : <><span style={{ fontSize: 17 }}>🔍</span> Verify</>
      }
    </button>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: "50%",
      border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "white",
      animation: "spin 0.8s linear infinite", flexShrink: 0
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   INFO CELL  — used in result grid
───────────────────────────────────────────────────────────────────────────── */
function InfoCell({ label, value, accent }) {
  if (!value) return null;
  return (
    <div style={{
      padding: "11px 14px", borderRadius: 14,
      background: accent ? `${accent}0d` : "rgba(255,255,255,0.6)",
      border: `1px solid ${accent ? `${accent}25` : "rgba(255,255,255,0.6)"}`,
    }}>
      <p style={{
        fontSize: 10.5, fontWeight: 700, color: T.muted,
        letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4
      }}>{label}</p>
      <p style={{
        fontSize: 13.5, fontWeight: 700, color: accent || T.deep,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
      }}>{value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   VERIFICATION RESULT PANEL
───────────────────────────────────────────────────────────────────────────── */
function ResultPanel({ result }) {
  const cfg = getCfg(result.result);
  const cred = result.credential;

  const issuerTrustColor = cred?.issuer?.trustLevel?.toLowerCase().includes("high") ? "#22c55e"
    : cred?.issuer?.trustLevel?.toLowerCase().includes("low") ? "#ef4444" : "#f59e0b";

  return (
    <div style={{ animation: "resultIn 0.45s cubic-bezier(.16,1,.3,1) both" }}>
      <TiltCard intensity={5}>
        <div style={{ padding: "28px 28px" }}>

          {/* Coloured result bar */}
          <div style={{ height: 4, borderRadius: 100, marginBottom: 24, background: cfg.bar }} />

          {/* Result header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16, marginBottom: 22, flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 20, flexShrink: 0,
                background: cfg.bg, border: `2px solid ${cfg.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, boxShadow: `0 6px 18px ${cfg.accent}22`,
              }}>{cfg.emoji}</div>
              <div>
                <h2 style={{
                  fontWeight: 800, fontSize: 20, color: cfg.text,
                  letterSpacing: "-0.02em", marginBottom: 4
                }}>{cfg.label}</h2>
                {result.fraudDetected && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 100, width: "fit-content",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)"
                  }}>
                    <span style={{ fontSize: 13 }}>🚨</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#991b1b" }}>
                      {result.fraudDetails || "Fraud detected"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust ring */}
            {cred?.trustScore > 0 && <TrustRing score={cred.trustScore} size={80} />}
          </div>

          {/* Credential details */}
          {cred && (
            <>
              <p style={{
                fontSize: 11, fontWeight: 800, color: T.muted,
                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12
              }}>
                CREDENTIAL DETAILS
              </p>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3,1fr)",
                gap: 10, marginBottom: 18
              }} className="result-grid">
                <InfoCell label="Title" value={cred.title} />
                <InfoCell label="Category" value={cred.category} />
                <InfoCell label="Owner" value={cred.owner?.name} />
                <InfoCell label="Issued" value={cred.issuedAt ? new Date(cred.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} />
                {cred.expiresAt && (
                  <InfoCell label="Expires" value={new Date(cred.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
                )}
                {cred.issuer && (
                  <InfoCell label="Issuer"
                    value={cred.issuer.organization || cred.issuer.name}
                    accent="#3b82f6" />
                )}
                {cred.issuer?.trustLevel && (
                  <InfoCell label="Issuer Trust"
                    value={cred.issuer.trustLevel}
                    accent={issuerTrustColor} />
                )}
                {cred.metadata?.institution && (
                  <InfoCell label="Institution" value={cred.metadata.institution} />
                )}
                {cred.metadata?.courseOrPosition && (
                  <InfoCell label="Course / Role" value={cred.metadata.courseOrPosition} />
                )}
              </div>

              {/* Revocation reason */}
              {cred.revocationReason && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 16px", borderRadius: 14, marginBottom: 16,
                  background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)"
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontSize: 13, color: "#991b1b", fontWeight: 500, lineHeight: 1.5 }}>
                    <strong>Revocation reason:</strong> {cred.revocationReason}
                  </p>
                </div>
              )}

              {/* Credential ID */}
              <div style={{
                padding: "10px 14px", borderRadius: 13, marginBottom: result.aiExplanation ? 16 : 0,
                background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.65)"
              }}>
                <p style={{
                  fontSize: 10.5, fontWeight: 700, color: T.muted,
                  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3
                }}>CREDENTIAL ID</p>
                <code style={{
                  fontFamily: "'JetBrains Mono','Fira Code',monospace",
                  fontSize: 13, fontWeight: 600, color: T.crimson
                }}>
                  {cred.credentialId}
                </code>
              </div>
            </>
          )}

          {/* AI Explanation */}
          {result.aiExplanation && (
            <div style={{
              marginTop: 16, padding: "16px 18px", borderRadius: 16,
              background: "rgba(139,92,246,0.07)", border: "1.5px solid rgba(139,92,246,0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <p style={{
                  fontSize: 11.5, fontWeight: 800, color: "#5b21b6",
                  letterSpacing: "0.06em", textTransform: "uppercase"
                }}>AI EXPLANATION</p>
              </div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontWeight: 400 }}>
                {result.aiExplanation}
              </p>
            </div>
          )}
        </div>
      </TiltCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HISTORY ITEM  — extracted so useState is valid (no hooks inside .map)
───────────────────────────────────────────────────────────────────────────── */
function HistoryItem({ item, onRerun }) {
  const { id, result: res, title, ts } = item;
  const cfg = getCfg(res);
  const [hov, setHov] = useState(false);

  return (
    <button onClick={() => onRerun(id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 13, border: "none",
        background: hov ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.45)",
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "all 0.18s",
        transform: hov ? "translateX(3px)" : "translateX(0)",
      }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{cfg.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 12.5, fontWeight: 700, color: T.deep,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
        }}>
          {title}
        </p>
        <p style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>
          {id.slice(0, 16)}…
        </p>
      </div>
      <span style={{ fontSize: 11, color: T.muted, flexShrink: 0 }}>
        {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function VerifierDashboard() {
  const [credId, setCredId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]); // recent verifications this session
  const inputRef = useRef(null);

  const verify = async () => {
    if (!credId.trim()) { toast.error("Enter a Credential ID"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await verifierAPI.verify({ credentialId: credId.trim() });
      setResult(data);
      // Save to session history
      setHistory(prev => [
        { id: credId.trim(), result: data.result, title: data.credential?.title || credId.trim(), ts: Date.now() },
        ...prev.filter(h => h.id !== credId.trim()),
      ].slice(0, 8));
    } catch (err) {
      const msg = err.response?.data;
      if (msg) setResult(msg);
      else toast.error("Verification failed");
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter") verify(); };

  const rerun = (id) => { setCredId(id); setResult(null); };

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }
          @keyframes spin     { to{transform:rotate(360deg)} }
          @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes resultIn { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
          @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }

          .shimmer-red {
            background:linear-gradient(90deg,#be123c 0%,#f43f5e 30%,#fda4af 50%,#f43f5e 70%,#be123c 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .fa1 { animation:fadeUp 0.6s cubic-bezier(.16,1,.3,1) both; }
          .fa2 { animation:fadeUp 0.6s 0.08s cubic-bezier(.16,1,.3,1) both; }
          .fa3 { animation:fadeUp 0.6s 0.16s cubic-bezier(.16,1,.3,1) both; }

          @media (max-width:900px) {
            .verifier-grid { grid-template-columns:1fr !important; }
            .result-grid   { grid-template-columns:repeat(2,1fr) !important; }
          }
          @media (max-width:540px) {
            .result-grid   { grid-template-columns:1fr !important; }
          }
        `}</style>

        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        <div className="fa1" style={{
          borderRadius: 26, padding: "28px 36px", marginBottom: 24,
          background: "linear-gradient(135deg,#4c0519 0%,#be123c 45%,#f43f5e 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden",
          boxShadow: "0 16px 48px rgba(190,18,60,0.32)",
        }}>
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
            }}>VERIFIER DASHBOARD</p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(20px,2.5vw,32px)", color: "white",
              letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4
            }}>
              Credential{" "}
              <span style={{ color: "rgba(253,164,175,0.95)" }}>Verification</span>
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>
              Instantly verify any TrustBridge credential — ID, trust score, issuer, AI analysis.
            </p>
          </div>

          {/* Live badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px", borderRadius: 100,
            background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)"
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#fda4af",
              animation: "pulse 2s infinite", flexShrink: 0
            }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>
              Live Verification
            </span>
          </div>
        </div>

        {/* ── TWO-COL LAYOUT ───────────────────────────────────────────── */}
        <div className="verifier-grid" style={{
          display: "grid", gridTemplateColumns: "1fr 300px", gap: 20,
        }}>

          {/* LEFT — search + result */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Search card */}
            <div className="fa2">
              <TiltCard intensity={5}>
                <div style={{ padding: "26px 28px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 22,
                    background: "linear-gradient(90deg,#f43f5e,#be123c,transparent)"
                  }} />

                  <p style={{
                    fontSize: 11, fontWeight: 800, color: T.muted,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14
                  }}>
                    ENTER CREDENTIAL ID
                  </p>

                  {/* Search input */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                        fontSize: 16, zIndex: 2, pointerEvents: "none",
                      }}>🔍</span>
                      <input ref={inputRef}
                        value={credId}
                        onChange={e => setCredId(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="e.g. TB-ABC123DEF456"
                        style={{
                          width: "100%", padding: "14px 16px 14px 44px",
                          border: `2px solid ${credId ? "rgba(244,63,94,0.45)" : "rgba(244,63,94,0.22)"}`,
                          borderRadius: 16,
                          background: credId ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
                          fontFamily: "'DM Sans',sans-serif",
                          fontFamily: "'JetBrains Mono','Fira Code',monospace",
                          fontSize: 14.5, fontWeight: 600, color: T.deep,
                          outline: "none", backdropFilter: "blur(8px)",
                          transition: "all 0.2s ease",
                          boxShadow: credId
                            ? "0 0 0 4px rgba(244,63,94,0.1), inset 0 2px 4px rgba(190,18,60,0.04)"
                            : "inset 0 2px 4px rgba(190,18,60,0.03)",
                          caretColor: T.crimson,
                        }}
                        onFocus={e => { e.target.style.borderColor = "rgba(244,63,94,0.6)"; e.target.style.boxShadow = "0 0 0 4px rgba(244,63,94,0.12), inset 0 2px 4px rgba(190,18,60,0.04)"; }}
                        onBlur={e => { e.target.style.borderColor = credId ? "rgba(244,63,94,0.45)" : "rgba(244,63,94,0.22)"; e.target.style.boxShadow = "inset 0 2px 4px rgba(190,18,60,0.03)"; }}
                      />
                    </div>
                    <VerifyBtn onClick={verify} loading={loading} disabled={!credId.trim()} />
                  </div>

                  <p style={{ fontSize: 12.5, color: "rgba(107,114,128,0.7)", fontWeight: 500 }}>
                    Credential IDs start with <code style={{
                      fontFamily: "monospace",
                      background: "rgba(244,63,94,0.08)", padding: "1px 6px", borderRadius: 5,
                      color: T.crimson, fontSize: 12
                    }}>TB-</code> followed by 12 characters.
                    Press Enter to verify.
                  </p>
                </div>
              </TiltCard>
            </div>

            {/* Result panel */}
            {result && <ResultPanel result={result} />}

            {/* Empty state tips */}
            {!result && !loading && (
              <div className="fa3">
                <TiltCard>
                  <div style={{ padding: "26px 28px" }}>
                    <div style={{
                      height: 3, borderRadius: 100, marginBottom: 20,
                      background: "linear-gradient(90deg,#f43f5e,#be123c,transparent)"
                    }} />
                    <p style={{
                      fontSize: 11, fontWeight: 800, color: T.muted,
                      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16
                    }}>
                      HOW TO VERIFY
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { step: "1", emoji: "🪪", text: "Ask the holder for their Credential ID (starts with TB-)" },
                        { step: "2", emoji: "⌨️", text: "Paste the ID in the search field above and click Verify" },
                        { step: "3", emoji: "📊", text: "View full credential details, trust score, and issuer info" },
                        { step: "4", emoji: "🤖", text: "Read the AI-powered explanation of the verification result" },
                        { step: "5", emoji: "🔗", text: "You can also use the verification link or scan a QR code" },
                      ].map(({ step, emoji, text }) => (
                        <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                            background: "linear-gradient(135deg,#f43f5e,#be123c)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800, color: "white",
                            boxShadow: "0 3px 10px rgba(244,63,94,0.28)",
                          }}>{step}</div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingTop: 3 }}>
                            <span style={{ fontSize: 15, flexShrink: 0 }}>{emoji}</span>
                            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.55, fontWeight: 500 }}>{text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </div>
            )}
          </div>

          {/* RIGHT — session history + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Verification stats this session */}
            <div className="fa2">
              <TiltCard>
                <div style={{ padding: "22px 20px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 16,
                    background: "linear-gradient(90deg,#f43f5e,#be123c,transparent)"
                  }} />
                  <p style={{
                    fontSize: 11, fontWeight: 800, color: T.muted,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14
                  }}>
                    THIS SESSION
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Verified", value: history.filter(h => h.result === "valid").length, bg: "rgba(34,197,94,0.1)", color: "#15803d" },
                      { label: "Checked", value: history.length, bg: "rgba(244,63,94,0.1)", color: T.crimson },
                      { label: "Invalid", value: history.filter(h => ["invalid", "tampered"].includes(h.result)).length, bg: "rgba(239,68,68,0.08)", color: "#991b1b" },
                      { label: "Not Found", value: history.filter(h => h.result === "not_found").length, bg: "rgba(107,114,128,0.08)", color: "#374151" },
                    ].map(({ label, value, bg, color }) => (
                      <div key={label} style={{
                        background: bg, borderRadius: 13, padding: "10px 12px",
                        border: `1px solid ${color}22`,
                      }}>
                        <p style={{
                          fontSize: 10.5, fontWeight: 700, color: T.muted,
                          letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 3
                        }}>{label}</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Recent verifications */}
            <div className="fa3">
              <TiltCard>
                <div style={{ padding: "22px 20px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 16,
                    background: "linear-gradient(90deg,#f43f5e,#be123c,transparent)"
                  }} />
                  <p style={{
                    fontSize: 11, fontWeight: 800, color: T.muted,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14
                  }}>
                    RECENT LOOKUPS
                  </p>

                  {history.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "28px 0" }}>
                      <span style={{ fontSize: 28 }}>🔍</span>
                      <p style={{ fontSize: 13, color: T.muted, marginTop: 8, fontWeight: 500 }}>
                        No verifications yet this session
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {history.map(item => (
                        <HistoryItem key={item.id} item={item} onRerun={rerun} />
                      ))}
                    </div>
                  )}
                </div>
              </TiltCard>
            </div>

            {/* Quick tip card */}
            <div style={{
              padding: "18px 20px", borderRadius: 22,
              background: "linear-gradient(135deg,#4c0519,#be123c)",
              position: "relative", overflow: "hidden",
              boxShadow: "0 8px 28px rgba(190,18,60,0.28)",
            }}>
              <div style={{
                position: "absolute", top: -20, right: -20, width: 100, height: 100,
                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none"
              }} />
              <p style={{
                fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8
              }}>DID YOU KNOW?</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.65, fontWeight: 400 }}>
                TrustBridge uses SHA-256 cryptographic hashing to detect document tampering automatically at every verification.
              </p>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
