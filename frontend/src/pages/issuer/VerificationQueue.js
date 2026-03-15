/**
 * TrustBridge — Issuer Verification Queue
 * Blue design system · tilt cards · full width · all functionality preserved
 * approve / reject / notes / expiry date all intact
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { issuerAPI } from "../../services/api";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS — Blue theme
───────────────────────────────────────────────────────────────────────────── */
const T = {
  white: "#ffffff",
  blue: "#3b82f6",
  royal: "#2563eb",
  navy: "#1d4ed8",
  deep: "#1e3a5f",
  muted: "#64748b",
  glass: "rgba(255,255,255,0.74)",
  glassBorder: "rgba(255,255,255,0.58)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Cloudinary PDF fix
───────────────────────────────────────────────────────────────────────────── */
const getDocUrl = (url) => {
  if (!url) return url;
  if (url.toLowerCase().includes(".pdf") && url.includes("/image/upload/"))
    return url.replace("/image/upload/", "/raw/upload/");
  return url;
};

/* ─────────────────────────────────────────────────────────────────────────────
   TILT CARD
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, style: extra = {}, intensity = 6 }) {
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
          ? "14px 20px 44px rgba(29,78,216,0.13), 0 4px 14px rgba(29,78,216,0.07)"
          : "6px 8px 24px rgba(29,78,216,0.08), 0 2px 6px rgba(29,78,216,0.05)",
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
   FLOAT INPUT
───────────────────────────────────────────────────────────────────────────── */
function FloatInput({ label, name, type = "text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const isDate = type === "date";
  const hasVal = String(value || "").length > 0;
  const lifted = focused || hasVal || isDate;

  return (
    <div style={{ position: "relative" }}>
      <label style={{
        position: "absolute", left: 14,
        top: lifted ? 7 : "50%",
        transform: lifted ? "translateY(0) scale(0.78)" : "translateY(-50%) scale(1)",
        transformOrigin: "left top",
        fontWeight: 700, fontSize: 13,
        color: focused ? T.blue : T.muted,
        pointerEvents: "none",
        transition: "all 0.2s cubic-bezier(.16,1,.3,1)",
        zIndex: 2, whiteSpace: "nowrap",
        maxWidth: isDate ? "calc(100% - 40px)" : "calc(100% - 16px)",
        overflow: "hidden", textOverflow: "ellipsis",
      }}>{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={focused && !isDate ? placeholder : ""}
        style={{
          width: "100%",
          paddingTop: lifted ? 22 : 14,
          paddingBottom: 8,
          paddingLeft: 14, paddingRight: isDate ? 40 : 14,
          border: `2px solid ${focused ? T.blue : "rgba(59,130,246,0.22)"}`,
          borderRadius: 14,
          background: focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14, fontWeight: 500, color: T.deep,
          outline: "none", backdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
          boxShadow: focused
            ? "0 0 0 4px rgba(59,130,246,0.1), inset 0 2px 4px rgba(29,78,216,0.04)"
            : "inset 0 2px 4px rgba(29,78,216,0.03)",
          caretColor: T.blue,
          colorScheme: "light",
        }}
      />
      {focused && (
        <div style={{
          position: "absolute", bottom: 0, left: 8, right: 8, height: 2,
          borderRadius: "0 0 14px 14px",
          background: "linear-gradient(90deg,#3b82f6,#1d4ed8)", opacity: 0.6
        }} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   METADATA ROW
───────────────────────────────────────────────────────────────────────────── */
function MetaRow({ emoji, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
      <span style={{ fontSize: 13, color: T.muted, fontWeight: 500, flexShrink: 0 }}>{label}:</span>
      <span style={{ fontSize: 13, color: T.deep, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   QUEUE CARD — single credential awaiting decision
───────────────────────────────────────────────────────────────────────────── */
function QueueCard({ cred, onAction, index }) {
  const [loading, setLoading] = useState(null); // "approve" | "reject"
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [rejected, setRejected] = useState(false);

  const approve = async () => {
    setLoading("approve");
    try {
      await issuerAPI.approve(cred._id, { notes, expiresAt: expiresAt || undefined });
      toast.success("Credential approved & issued! ✅");
      onAction(cred._id, "approved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally { setLoading(null); }
  };

  const reject = async () => {
    if (!reason.trim()) { toast.error("Rejection reason is required"); return; }
    setLoading("reject");
    try {
      await issuerAPI.reject(cred._id, { reason });
      toast("Credential rejected");
      onAction(cred._id, "rejected");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally { setLoading(null); }
  };

  const submitDate = new Date(cred.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  // Dynamically show all metadata fields
  const META_LABELS = {
    institution: { emoji: "🏛️", label: "Institution" },
    courseOrPosition: { emoji: "📚", label: "Course / Position" },
    grade: { emoji: "⭐", label: "Grade / Score" },
    completionDate: { emoji: "📅", label: "Completion Date" },
    rollNumber: { emoji: "🔢", label: "Roll / Reg. No." },
    department: { emoji: "🏗️", label: "Department" },
    employeeId: { emoji: "🔢", label: "Employee ID" },
    startDate: { emoji: "📅", label: "Start Date" },
    certificationId: { emoji: "🔢", label: "Certificate ID" },
    expiryDate: { emoji: "📅", label: "Expiry Date" },
    fullName: { emoji: "👤", label: "Full Name" },
    documentNumber: { emoji: "🔢", label: "Document No." },
    dateOfBirth: { emoji: "🎂", label: "Date of Birth" },
    nationality: { emoji: "🌍", label: "Nationality" },
    financialYear: { emoji: "📅", label: "Financial Year" },
    annualIncome: { emoji: "💰", label: "Annual Income" },
    duration: { emoji: "⏱️", label: "Duration" },
  };

  return (
    <div style={{
      animation: `fadeUp 0.5s ${index * 60}ms cubic-bezier(.16,1,.3,1) both`,
    }}>
      <TiltCard>
        <div style={{ padding: "24px 26px" }}>

          {/* Top accent bar */}
          <div style={{
            height: 3, borderRadius: 100, marginBottom: 22,
            background: "linear-gradient(90deg,#f59e0b,#f97316,transparent)"
          }} />

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 14, marginBottom: 16
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h3 style={{
                  fontWeight: 800, fontSize: 16, color: T.deep,
                  letterSpacing: "-0.01em", lineHeight: 1.2
                }}>{cred.title}</h3>
                <span style={{
                  fontSize: 11.5, fontWeight: 800, padding: "3px 11px", borderRadius: 100,
                  background: "rgba(245,158,11,0.12)", color: "#92400e",
                  border: "1px solid rgba(245,158,11,0.25)", textTransform: "capitalize",
                }}>⏳ Pending</span>
              </div>
              <p style={{ fontSize: 12.5, color: T.muted, fontWeight: 500, marginBottom: 2 }}>
                <span style={{ textTransform: "capitalize" }}>{cred.category}</span>
                {" · "}Submitted by{" "}
                <span style={{ fontWeight: 700, color: T.navy }}>{cred.owner?.name}</span>
              </p>
              <p style={{ fontSize: 12, color: "rgba(100,116,139,0.8)" }}>{cred.owner?.email}</p>
            </div>

            {/* Document link */}
            <a href={getDocUrl(cred.documentUrl)} target="_blank" rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
                padding: "8px 14px", borderRadius: 12,
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)",
                fontSize: 13, fontWeight: 700, color: T.navy, textDecoration: "none",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.18)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              📄 View Doc
            </a>
          </div>

          {/* ── METADATA ───────────────────────────────────────────── */}
          {cred.metadata && Object.keys(cred.metadata).length > 0 && (
            <div style={{
              padding: "14px 16px", borderRadius: 16, marginBottom: 16,
              background: "rgba(239,246,255,0.7)", border: "1.5px solid rgba(59,130,246,0.15)",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {Object.entries(cred.metadata).map(([key, value]) => {
                const cfg = META_LABELS[key];
                return cfg && value ? (
                  <MetaRow key={key} emoji={cfg.emoji} label={cfg.label} value={value} />
                ) : null;
              })}
              {cred.description && (
                <MetaRow emoji="📝" label="Description" value={cred.description} />
              )}
            </div>
          )}

          {/* Submit date */}
          <p style={{ fontSize: 12, color: "rgba(100,116,139,0.65)", marginBottom: 18, fontWeight: 500 }}>
            📅 Submitted {submitDate}
          </p>

          {/* ── APPROVE FIELDS ─────────────────────────────────────── */}
          <div style={{ borderTop: "1.5px solid rgba(59,130,246,0.12)", paddingTop: 18 }}>
            <p style={{
              fontSize: 11, fontWeight: 800, color: T.muted,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12
            }}>
              ISSUANCE DETAILS
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}
              className="queue-approve-grid">
              <FloatInput
                label="📝 Issuer Notes (optional)"
                name="notes" value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes for the holder…"
              />
              <FloatInput
                label="📅 Expiry Date (optional)"
                name="expiresAt" type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* Approve */}
              <ApproveBtn loading={loading === "approve"} onClick={approve} disabled={!!loading} />
              {/* Reject toggle */}
              <RejectToggleBtn
                open={showReject}
                onClick={() => setShowReject(!showReject)}
                disabled={!!loading}
              />
            </div>

            {/* Reject panel */}
            {showReject && (
              <div style={{ marginTop: 14, animation: "slideIn 0.25s cubic-bezier(.16,1,.3,1) both" }}>
                <FloatInput
                  label="⚠️ Rejection Reason (required)"
                  name="reason" value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Why is this credential being rejected?"
                />
                <button onClick={reject} disabled={!!loading || !reason.trim()}
                  style={{
                    marginTop: 10, width: "100%", padding: "13px 20px",
                    borderRadius: 14, border: "none",
                    background: (!loading && reason.trim())
                      ? "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "rgba(239,68,68,0.3)",
                    color: "white", fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 800, fontSize: 14,
                    cursor: (!loading && reason.trim()) ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: (!loading && reason.trim())
                      ? "0 6px 20px rgba(239,68,68,0.28)" : "none",
                    transition: "all 0.2s ease",
                  }}>
                  {loading === "reject"
                    ? <><Spinner /> Rejecting…</>
                    : "✕ Confirm Rejection"
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   APPROVE BUTTON — magnetic
───────────────────────────────────────────────────────────────────────────── */
function ApproveBtn({ loading, onClick, disabled }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const isDisabled = disabled;

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
        flex: 1, padding: "13px 20px", borderRadius: 14, border: "none",
        background: isDisabled ? "rgba(59,130,246,0.38)"
          : hov ? "linear-gradient(135deg,#1d4ed8,#1e3a5f)"
            : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
        color: "white", fontFamily: "'DM Sans',sans-serif",
        fontWeight: 800, fontSize: 14,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transform: hov && !isDisabled ? `translate(${pos.x}px,${pos.y}px) scale(1.03)` : "translate(0,0) scale(1)",
        transition: "transform 0.08s ease, box-shadow 0.2s ease, background 0.2s ease",
        boxShadow: hov && !isDisabled
          ? "0 16px 40px rgba(29,78,216,0.38), inset 0 1px 0 rgba(255,255,255,0.22)"
          : isDisabled ? "none"
            : "0 6px 22px rgba(29,78,216,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
      {loading ? <><Spinner /> Approving…</> : "✓ Approve & Issue"}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   REJECT TOGGLE BUTTON
───────────────────────────────────────────────────────────────────────────── */
function RejectToggleBtn({ open, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: "13px 20px", borderRadius: 14,
        border: `2px solid ${open ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.28)"}`,
        background: open ? "rgba(239,68,68,0.1)" : hov ? "rgba(239,68,68,0.07)" : "transparent",
        color: "#991b1b", fontFamily: "'DM Sans',sans-serif",
        fontWeight: 800, fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.18s ease",
        transform: hov && !disabled ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hov && !disabled ? "0 6px 18px rgba(239,68,68,0.15)" : "none",
      }}>
      {open ? "✕ Cancel" : "✕ Reject"}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SPINNER
───────────────────────────────────────────────────────────────────────────── */
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
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function VerificationQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuerAPI.getQueue()
      .then(({ data }) => setQueue(data.credentials || []))
      .catch(() => toast.error("Failed to load queue"))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (id) => {
    setQueue(prev => prev.filter(c => c._id !== id));
  };

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }
          @keyframes spin    { to{transform:rotate(360deg)} }
          @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
          @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes shimmer2{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }

          .shimmer-text-blue {
            background:linear-gradient(90deg,#1d4ed8 0%,#3b82f6 30%,#93c5fd 50%,#3b82f6 70%,#1d4ed8 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .skel { background:linear-gradient(90deg,rgba(219,234,254,0.7) 25%,rgba(191,219,254,0.55) 50%,rgba(219,234,254,0.7) 75%);
            background-size:200% 100%; animation:shimmer2 1.4s infinite; border-radius:26px; }

          @media (max-width:600px) {
            .queue-approve-grid { grid-template-columns:1fr !important; }
          }
        `}</style>

        {/* ── HERO BANNER ──────────────────────────────────────────── */}
        <div style={{
          borderRadius: 26, padding: "26px 34px", marginBottom: 24,
          background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 45%,#3b82f6 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14, position: "relative", overflow: "hidden",
          boxShadow: "0 14px 44px rgba(29,78,216,0.28)",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 180, height: 180,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -20, right: -20, width: 110, height: 110,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", pointerEvents: "none"
          }} />

          <div>
            <p style={{
              fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8
            }}>
              VERIFICATION QUEUE
            </p>
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(20px,2.5vw,30px)", color: "white",
              letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4
            }}>
              Pending Requests
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
              {loading ? "Loading…" : `${queue.length} credential${queue.length !== 1 ? "s" : ""} awaiting your review`}
            </p>
          </div>

          {/* Count badge */}
          {!loading && queue.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 22px", borderRadius: 100,
              background: "rgba(245,158,11,0.25)", border: "1.5px solid rgba(245,158,11,0.4)",
            }}>
              <span style={{ fontSize: 20 }}>⏳</span>
              <div>
                <p style={{
                  fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.08em", textTransform: "uppercase"
                }}>Pending</p>
                <p style={{ fontWeight: 800, fontSize: 22, color: "white" }}>{queue.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── CONTENT ──────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[1, 2].map(i => <div key={i} className="skel" style={{ height: 280 }} />)}
          </div>

        ) : queue.length === 0 ? (
          <TiltCard>
            <div style={{ padding: "72px 40px", textAlign: "center" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 28, margin: "0 auto 22px",
                background: "rgba(59,130,246,0.1)", border: "1.5px solid rgba(59,130,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36
              }}>
                ✅
              </div>
              <p style={{ fontWeight: 800, fontSize: 20, color: T.deep, marginBottom: 8 }}>
                Queue is clear!
              </p>
              <p style={{ fontSize: 14.5, color: T.muted, lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>
                All credential requests have been processed. Check back later for new submissions.
              </p>
            </div>
          </TiltCard>

        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {queue.map((cred, i) => (
              <QueueCard key={cred._id} cred={cred} onAction={handleAction} index={i} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
