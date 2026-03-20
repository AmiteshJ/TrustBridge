/**
 * TrustBridge — Upload Credential Page
 * Category-aware dynamic fields · fixed date inputs · full width · better UX
 * Functionality unchanged: file upload, FormData, API call, navigation
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { credentialAPI } from "../../services/api";
import DashboardLayout from "../../components/common/DashboardLayout";

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
};

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY DEFINITIONS
───────────────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: "education", emoji: "🎓", label: "Education" },
  { value: "employment", emoji: "💼", label: "Employment" },
  { value: "certification", emoji: "📜", label: "Certification" },
  { value: "identity", emoji: "🪪", label: "Identity" },
  { value: "finance", emoji: "💰", label: "Finance" },
  { value: "training", emoji: "🏋️", label: "Training" },
  { value: "other", emoji: "📋", label: "Other" },
];

const CATEGORY_FIELDS = {
  education: [
    { name: "institution", label: "🏛️ Institution / University", placeholder: "e.g. University of Mumbai", required: true },
    { name: "courseOrPosition", label: "📚 Course / Degree", placeholder: "e.g. B.Tech Computer Science", required: true, half: true },
    { name: "grade", label: "⭐ Grade / CGPA", placeholder: "e.g. 8.5 CGPA / 85%", half: true },
    { name: "rollNumber", label: "🔢 Roll Number / Reg. No.", placeholder: "e.g. 2021CS001", half: true },
    { name: "completionDate", label: "📅 Completion Date", placeholder: "", type: "date", half: true },
    { name: "description", label: "📝 Additional Notes", placeholder: "Any extra details…", as: "textarea" },
  ],
  employment: [
    { name: "institution", label: "🏢 Company / Organization", placeholder: "e.g. TechCorp Solutions Ltd.", required: true },
    { name: "courseOrPosition", label: "💼 Job Title / Position", placeholder: "e.g. Senior Software Engineer", required: true, half: true },
    { name: "department", label: "🏗️ Department", placeholder: "e.g. Engineering", half: true },
    { name: "employeeId", label: "🔢 Employee ID", placeholder: "e.g. EMP-2024-001", half: true },
    { name: "startDate", label: "📅 Start Date", placeholder: "", type: "date", half: true },
    { name: "completionDate", label: "📅 End Date", placeholder: "", type: "date", half: true },
    { name: "grade", label: "💰 Salary / CTC (optional)", placeholder: "e.g. ₹12 LPA", half: true },
    { name: "description", label: "📝 Role Description", placeholder: "Brief description of role…", as: "textarea" },
  ],
  certification: [
    { name: "institution", label: "🏛️ Issuing Authority", placeholder: "e.g. AWS, Google, NASSCOM", required: true },
    { name: "courseOrPosition", label: "📜 Certificate Name", placeholder: "e.g. AWS Solutions Architect", required: true, half: true },
    { name: "grade", label: "⭐ Score / Grade", placeholder: "e.g. 920/1000", half: true },
    { name: "certificationId", label: "🔢 Certificate ID / Code", placeholder: "e.g. AWS-SAA-C003-2024", half: true },
    { name: "completionDate", label: "📅 Issue Date", placeholder: "", type: "date", half: true },
    { name: "expiryDate", label: "📅 Expiry Date", placeholder: "", type: "date", half: true },
    { name: "description", label: "📝 Additional Notes", placeholder: "Any extra details…", as: "textarea" },
  ],
  identity: [
    { name: "fullName", label: "👤 Full Name (as on document)", placeholder: "e.g. Arjun Ramesh Sharma", required: true },
    { name: "documentNumber", label: "🔢 Document Number", placeholder: "e.g. ABCDE1234F / 1234-5678-9012", required: true, half: true },
    { name: "institution", label: "🏛️ Issuing Authority", placeholder: "e.g. UIDAI / Income Tax Dept.", half: true },
    { name: "dateOfBirth", label: "🎂 Date of Birth", placeholder: "", type: "date", half: true },
    { name: "completionDate", label: "📅 Issue Date", placeholder: "", type: "date", half: true },
    { name: "expiryDate", label: "📅 Expiry Date", placeholder: "", type: "date", half: true },
    { name: "nationality", label: "🌍 Nationality", placeholder: "e.g. Indian", half: true },
    { name: "description", label: "📝 Additional Notes", placeholder: "Any extra details…", as: "textarea" },
  ],
  finance: [
    { name: "institution", label: "🏛️ Issuing Authority", placeholder: "e.g. Tahsildar Office / Employer", required: true },
    { name: "courseOrPosition", label: "📄 Document Sub-type", placeholder: "e.g. Annual Income Certificate", required: true, half: true },
    { name: "financialYear", label: "📅 Financial Year", placeholder: "e.g. 2023-24", half: true },
    { name: "annualIncome", label: "💰 Annual Income / Amount", placeholder: "e.g. ₹4,50,000", half: true },
    { name: "completionDate", label: "📅 Issue Date", placeholder: "", type: "date", half: true },
    { name: "expiryDate", label: "📅 Valid Until", placeholder: "", type: "date", half: true },
    { name: "grade", label: "📋 Category / Class", placeholder: "e.g. OBC / General", half: true },
    { name: "description", label: "📝 Additional Notes", placeholder: "Any extra details…", as: "textarea" },
  ],
  training: [
    { name: "institution", label: "🏛️ Training Institute", placeholder: "e.g. NIIT, Coursera, Udemy", required: true },
    { name: "courseOrPosition", label: "📚 Course / Program Name", placeholder: "e.g. Full Stack Development", required: true, half: true },
    { name: "grade", label: "⭐ Score / Grade", placeholder: "e.g. 95% / A+", half: true },
    { name: "duration", label: "⏱️ Duration", placeholder: "e.g. 6 months / 120 hours", half: true },
    { name: "completionDate", label: "📅 Completion Date", placeholder: "", type: "date", half: true },
    { name: "rollNumber", label: "🔢 Enrollment / Certificate ID", placeholder: "e.g. NIIT-2024-12345", half: true },
    { name: "description", label: "📝 Skills Covered", placeholder: "List key skills covered…", as: "textarea" },
  ],
  other: [
    { name: "institution", label: "🏛️ Issuing Authority", placeholder: "Who issued this document?" },
    { name: "courseOrPosition", label: "📋 Document Type / Subject", placeholder: "What is this document about?", half: true },
    { name: "grade", label: "🔢 Reference Number", placeholder: "Any reference / ID number", half: true },
    { name: "completionDate", label: "📅 Issue Date", placeholder: "", type: "date", half: true },
    { name: "expiryDate", label: "📅 Expiry Date", placeholder: "", type: "date", half: true },
    { name: "description", label: "📝 Description", placeholder: "Describe this document…", as: "textarea" },
  ],
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
   FLOAT INPUT  — fixed for date type: label always lifted, no overlap
───────────────────────────────────────────────────────────────────────────── */
function FloatInput({ label, name, type = "text", value, onChange, placeholder, required, as, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const isDate = type === "date";
  const hasVal = String(value || "").length > 0;
  // Date inputs ALWAYS show placeholder text (mm/dd/yyyy) so label must always stay lifted
  const lifted = focused || hasVal || isDate;

  const inputStyle = {
    width: "100%",
    // Date inputs need extra top padding so value doesn't sit under the label
    paddingTop: lifted ? (isDate ? 26 : 24) : 17,
    paddingBottom: isDate ? 8 : (lifted ? 8 : 17),
    paddingLeft: 16,
    paddingRight: isDate ? 42 : 16, // extra right space for the calendar icon
    border: `2px solid ${focused ? T.emerald : "rgba(45,206,122,0.22)"}`,
    borderRadius: 15,
    background: focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 14.5, fontWeight: 500, color: T.deep,
    outline: "none", backdropFilter: "blur(8px)",
    transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
    boxShadow: focused
      ? "0 0 0 4px rgba(45,206,122,0.12), inset 0 2px 4px rgba(7,107,60,0.04)"
      : "inset 0 2px 4px rgba(7,107,60,0.03)",
    caretColor: T.emerald,
    // Ensure date input text colour shows properly
    colorScheme: "light",
  };

  const labelStyle = {
    position: "absolute", left: 16,
    // For date: always stay at top (lifted). For others: animate based on focus/value
    top: lifted ? 7 : "50%",
    transform: lifted ? "translateY(0) scale(0.8)" : "translateY(-50%) scale(1)",
    transformOrigin: "left top",
    fontWeight: 700,
    fontSize: 14,
    color: focused ? T.emerald : T.muted,
    pointerEvents: "none",
    transition: "all 0.2s cubic-bezier(.16,1,.3,1)",
    zIndex: 2,
    letterSpacing: "0.01em",
    // Keep label above the date picker icon
    maxWidth: isDate ? "calc(100% - 48px)" : "calc(100% - 20px)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div style={{ position: "relative" }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>

      {as === "textarea" ? (
        <textarea
          name={name} value={value} onChange={onChange} rows={rows}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ""}
          style={{
            ...inputStyle,
            paddingTop: 28, paddingBottom: 10,
            resize: "none",
            // textarea label always lifted
          }}
        />
      ) : (
        <input
          name={name} type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={focused && !isDate ? placeholder : ""}
          required={required}
          style={inputStyle}
        />
      )}

      {/* Focused indicator line at bottom */}
      {focused && (
        <div style={{
          position: "absolute", bottom: 0, left: 8, right: 8, height: 2,
          borderRadius: "0 0 15px 15px",
          background: `linear-gradient(90deg, ${T.jade}, ${T.emerald})`,
          opacity: 0.7,
        }} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROGRESS STEPS INDICATOR
───────────────────────────────────────────────────────────────────────────── */
function StepBadge({ n, label, done, active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: done
          ? "linear-gradient(135deg,#2dce7a,#0ea55e)"
          : active
            ? "linear-gradient(135deg,#2dce7a,#0ea55e)"
            : "rgba(90,125,106,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: done ? 13 : 12, fontWeight: 800,
        color: done || active ? "white" : T.muted,
        boxShadow: active ? "0 4px 12px rgba(45,206,122,0.3)" : "none",
        transition: "all 0.3s ease",
      }}>
        {done ? "✓" : n}
      </div>
      <span style={{
        fontSize: 12.5, fontWeight: 700,
        color: active ? T.forest : done ? T.emerald : T.muted,
        transition: "color 0.3s"
      }}>
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC SUBMIT
───────────────────────────────────────────────────────────────────────────── */
function SubmitBtn({ loading, disabled }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const isDisabled = loading || disabled;

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  }, []);

  return (
    <button ref={ref} type="submit" disabled={isDisabled}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setPos({ x: 0, y: 0 }); setHov(false); }}
      style={{
        width: "100%", padding: "17px 24px", border: "none", borderRadius: 18,
        background: isDisabled ? "rgba(45,206,122,0.38)"
          : hov ? "linear-gradient(135deg,#0ea55e,#076b3c)"
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
          : isDisabled ? "none"
            : "0 8px 28px rgba(14,165,94,0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        letterSpacing: "0.01em",
      }}>
      {loading ? (
        <>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "white",
            animation: "spin 0.8s linear infinite", flexShrink: 0
          }} />
          Submitting for Verification…
        </>
      ) : (
        <><span style={{ fontSize: 18 }}>⬆</span> Submit for Verification</>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function UploadCredential() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("education");
  const [fields, setFields] = useState({});
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => { setFields({}); }, [category]);

  const handleFieldChange = (e) =>
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) { toast.error("Only JPG, PNG, PDF under 10MB"); return; }
    const f = accepted[0];
    setFile(f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"], "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024, multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a document file"); return; }
    if (!title.trim()) { toast.error("Credential title is required"); return; }

    const fd = new FormData();
    fd.append("document", file);
    fd.append("title", title.trim());
    fd.append("category", category);
    Object.entries(fields).forEach(([k, v]) => {
      if (v && String(v).trim()) fd.append(k, String(v).trim());
    });

    setLoading(true);
    try {
      await credentialAPI.upload(fd);
      toast.success("Credential submitted for verification! 🎉");
      navigate("/wallet");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally { setLoading(false); }
  };

  const activeCategory = CATEGORIES.find(c => c.value === category);
  const currentFields = CATEGORY_FIELDS[category] || CATEGORY_FIELDS.other;

  // Pair half-width fields
  const fieldRows = [];
  let i = 0;
  while (i < currentFields.length) {
    const f = currentFields[i];
    if (f.half && i + 1 < currentFields.length && currentFields[i + 1].half) {
      fieldRows.push({ type: "pair", left: f, right: currentFields[i + 1] });
      i += 2;
    } else {
      fieldRows.push({ type: "single", field: f });
      i++;
    }
  }

  const step1Done = !!file;
  const step2Done = !!category;
  const step3Done = !!title.trim();

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }
          @keyframes spin    { to{ transform:rotate(360deg) } }
          @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes filePop { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }

          .shimmer-text {
            background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }
          .fa1 { animation:fadeUp 0.55s cubic-bezier(.16,1,.3,1) both; }
          .fa2 { animation:fadeUp 0.55s 0.07s cubic-bezier(.16,1,.3,1) both; }
          .fa3 { animation:fadeUp 0.55s 0.14s cubic-bezier(.16,1,.3,1) both; }
          .fa4 { animation:fadeUp 0.55s 0.21s cubic-bezier(.16,1,.3,1) both; }
          .fa5 { animation:fadeUp 0.55s 0.28s cubic-bezier(.16,1,.3,1) both; }

          .cat-pill {
            display:inline-flex; align-items:center; gap:7px;
            padding:9px 16px; border-radius:100px; cursor:pointer;
            border:2px solid transparent;
            font-family:'DM Sans',sans-serif; font-weight:700; font-size:13px;
            transition:all 0.22s cubic-bezier(.16,1,.3,1); user-select:none;
          }
          .cat-pill:hover { transform:translateY(-2px); }
          .fields-animate { animation:slideIn 0.35s cubic-bezier(.16,1,.3,1) both; }
          .dropzone-zone  { border:2.5px dashed rgba(45,206,122,0.35); border-radius:22px; transition:all 0.22s; cursor:pointer; }
          .dropzone-zone:hover, .dropzone-zone.drag-active {
            border-color:rgba(45,206,122,0.72); background:rgba(212,245,226,0.28);
          }

          /* Fix native date picker appearance across browsers */
          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity:0.6; cursor:pointer;
            filter: invert(35%) sepia(60%) saturate(500%) hue-rotate(100deg);
          }
          input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity:1; }
          input[type="date"]::-webkit-datetime-edit { padding:0; color:#043d22; }
          input[type="date"]::-webkit-datetime-edit-fields-wrapper { padding:0; }

          @media (max-width:600px) {
            .field-pair { grid-template-columns:1fr !important; }
            .upload-layout { grid-template-columns:1fr !important; }
          }
          @media (max-width:900px) {
            .upload-layout { grid-template-columns:1fr !important; }
          }
        `}</style>

        {/* ── PAGE HEADER ────────────────────────────────────────────── */}
        <div className="fa1" style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 12, fontWeight: 800, color: T.emerald,
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10
          }}>NEW SUBMISSION</p>
          <h1 style={{
            fontWeight: 800, fontSize: "clamp(24px,2.8vw,36px)", color: T.deep,
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8
          }}>
            Upload <span className="shimmer-text">Credential.</span>
          </h1>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 18 }}>
            Pick a category first — the form adapts to show only relevant fields.
          </p>

          {/* Step progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <StepBadge n="1" label="Upload File" done={step1Done} active={!step1Done} />
            <div style={{ width: 24, height: 2, borderRadius: 2, background: "rgba(45,206,122,0.2)", flexShrink: 0 }} />
            <StepBadge n="2" label="Choose Category" done={step2Done} active={step1Done && step2Done} />
            <div style={{ width: 24, height: 2, borderRadius: 2, background: "rgba(45,206,122,0.2)", flexShrink: 0 }} />
            <StepBadge n="3" label="Fill Details" done={step3Done} active={step1Done && !step3Done} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── TWO-COLUMN LAYOUT ──────────────────────────────────────── */}
          <div className="upload-layout" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20,
          }}>

            {/* LEFT — File + Category */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* STEP 1: File Drop Zone */}
              <div className="fa2">
                <TiltCard intensity={4}>
                  <div>
                    <div style={{
                      height: 4, borderRadius: "24px 24px 0 0",
                      background: "linear-gradient(90deg,#2dce7a,#0ea55e,#076b3c)"
                    }} />
                    <div style={{ padding: "6px 6px 6px" }}>
                      <div {...getRootProps()}
                        className={`dropzone-zone ${isDragActive ? "drag-active" : ""}`}
                        style={{ padding: file ? "16px 18px" : "36px 20px", textAlign: "center" }}>
                        <input {...getInputProps()} />
                        {file ? (
                          <div style={{
                            display: "flex", alignItems: "center", gap: 12,
                            animation: "filePop 0.3s cubic-bezier(.16,1,.3,1) both"
                          }}>
                            {preview
                              ? <img src={preview} alt="preview" style={{
                                width: 54, height: 54,
                                borderRadius: 13, objectFit: "cover",
                                boxShadow: "0 4px 14px rgba(7,107,60,0.14)", flexShrink: 0
                              }} />
                              : <div style={{
                                width: 54, height: 54, borderRadius: 13, flexShrink: 0,
                                background: "linear-gradient(135deg,rgba(212,245,226,0.9),rgba(168,237,202,0.7))",
                                border: "1px solid rgba(45,206,122,0.25)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24
                              }}>📄</div>
                            }
                            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                              <p style={{
                                fontWeight: 700, fontSize: 13.5, color: T.deep,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4
                              }}>
                                {file.name}
                              </p>
                              <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{
                                  fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 100,
                                  background: "rgba(45,206,122,0.12)", color: T.forest,
                                  border: "1px solid rgba(45,206,122,0.2)"
                                }}>✓ Ready</span>
                                <span style={{ fontSize: 11.5, color: T.muted }}>
                                  {(file.size / 1024).toFixed(0)} KB · {file.name.split(".").pop().toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <button type="button"
                              onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                              style={{
                                width: 32, height: 32, borderRadius: 10, border: "none",
                                background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, transition: "all 0.18s", flexShrink: 0
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div style={{
                              width: 56, height: 56, borderRadius: 18, margin: "0 auto 14px",
                              background: "linear-gradient(135deg,rgba(212,245,226,0.8),rgba(168,237,202,0.6))",
                              border: "1.5px solid rgba(45,206,122,0.25)",
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                              animation: isDragActive ? "bounce 0.5s ease infinite" : "none"
                            }}>
                              {isDragActive ? "📂" : "⬆️"}
                            </div>
                            <p style={{
                              fontWeight: 800, fontSize: 14.5,
                              color: isDragActive ? T.forest : T.deep, marginBottom: 5
                            }}>
                              {isDragActive ? "Drop it here!" : "Drag & drop or click to upload"}
                            </p>
                            <p style={{ fontSize: 12.5, color: T.muted }}>PDF, JPG, PNG · Max 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>

              {/* STEP 2: Category pills */}
              <div className="fa3">
                <TiltCard intensity={5}>
                  <div style={{ padding: "20px 20px" }}>
                    <div style={{
                      height: 3, borderRadius: 100, marginBottom: 16,
                      background: "linear-gradient(90deg,#2dce7a,#0ea55e,transparent)"
                    }} />
                    <p style={{
                      fontSize: 11, fontWeight: 800, color: T.muted,
                      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12
                    }}>
                      CREDENTIAL CATEGORY
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {CATEGORIES.map(({ value, emoji, label }) => {
                        const active = category === value;
                        return (
                          <button key={value} type="button" className="cat-pill"
                            onClick={() => setCategory(value)}
                            style={{
                              background: active ? "linear-gradient(135deg,#2dce7a,#0ea55e)" : "rgba(255,255,255,0.65)",
                              color: active ? "white" : T.muted,
                              borderColor: active ? "transparent" : "rgba(45,206,122,0.2)",
                              boxShadow: active
                                ? "0 5px 16px rgba(45,206,122,0.28), inset 0 1px 0 rgba(255,255,255,0.2)"
                                : "0 2px 6px rgba(7,107,60,0.05)",
                              transform: active ? "translateY(-2px)" : "translateY(0)",
                            }}>
                            <span style={{ fontSize: 15 }}>{emoji}</span>{label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </TiltCard>
              </div>

              {/* Info notice */}
              <div className="fa5">
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "14px 16px", borderRadius: 18,
                  background: "rgba(254,243,199,0.6)", border: "1.5px solid rgba(245,158,11,0.25)",
                  backdropFilter: "blur(8px)"
                }}>
                  <span style={{ fontSize: 17, flexShrink: 0 }}>ℹ️</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 2 }}>Review Process</p>
                    <p style={{ fontSize: 12.5, color: "#a16207", lineHeight: 1.6, fontWeight: 400 }}>
                      Your credential will be reviewed by a registered issuer.
                      You'll receive an email when the status changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Dynamic Details Form */}
            <div className="fa4" key={category}>
              <TiltCard intensity={5} style={{ height: "100%" }}>
                <div style={{ padding: "22px 22px" }}>
                  <div style={{
                    height: 3, borderRadius: 100, marginBottom: 18,
                    background: "linear-gradient(90deg,#2dce7a,#0ea55e,transparent)"
                  }} />

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <p style={{
                      fontSize: 11, fontWeight: 800, color: T.muted,
                      letterSpacing: "0.1em", textTransform: "uppercase"
                    }}>
                      CREDENTIAL DETAILS
                    </p>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 11px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                      background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
                      color: "white", boxShadow: "0 3px 10px rgba(45,206,122,0.28)",
                    }}>
                      <span style={{ fontSize: 13 }}>{activeCategory?.emoji}</span>
                      {activeCategory?.label}
                    </span>
                  </div>

                  <div className="fields-animate" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* Title — always first */}
                    <FloatInput
                      label={`${activeCategory?.emoji || "📋"} Credential Title`}
                      name="title" value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder={
                        category === "education" ? "e.g. B.Tech Computer Science" :
                          category === "employment" ? "e.g. Employment Certificate – TechCorp" :
                            category === "certification" ? "e.g. AWS Solutions Architect Certificate" :
                              category === "identity" ? "e.g. Aadhaar Card" :
                                category === "finance" ? "e.g. Annual Income Certificate 2024" :
                                  category === "training" ? "e.g. Full Stack Development Course Certificate" :
                                    "e.g. Document Title"
                      }
                      required
                    />

                    {/* Category-specific fields */}
                    {fieldRows.map((row, idx) => {
                      if (row.type === "pair") {
                        return (
                          <div key={idx} className="field-pair"
                            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <FloatInput
                              label={row.left.label} name={row.left.name}
                              type={row.left.type || "text"}
                              value={fields[row.left.name] || ""}
                              onChange={handleFieldChange}
                              placeholder={row.left.placeholder}
                              required={row.left.required}
                              as={row.left.as} rows={row.left.rows}
                            />
                            <FloatInput
                              label={row.right.label} name={row.right.name}
                              type={row.right.type || "text"}
                              value={fields[row.right.name] || ""}
                              onChange={handleFieldChange}
                              placeholder={row.right.placeholder}
                              required={row.right.required}
                              as={row.right.as} rows={row.right.rows}
                            />
                          </div>
                        );
                      }
                      return (
                        <FloatInput key={idx}
                          label={row.field.label} name={row.field.name}
                          type={row.field.type || "text"}
                          value={fields[row.field.name] || ""}
                          onChange={handleFieldChange}
                          placeholder={row.field.placeholder}
                          required={row.field.required}
                          as={row.field.as} rows={row.field.rows}
                        />
                      );
                    })}
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>

          {/* ── SUBMIT ─────────────────────────────────────────────────── */}
          <div className="fa5">
            <SubmitBtn loading={loading} disabled={!file || !title.trim()} />
            {!file && (
              <p style={{ textAlign: "center", fontSize: 12.5, color: T.muted, marginTop: 10, fontWeight: 500 }}>
                ↑ Select a document file first to enable submission
              </p>
            )}
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
