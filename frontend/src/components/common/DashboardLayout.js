/**
 * TrustBridge — DashboardLayout
 * Redesigned sidebar: glass morphism · gradient active states · role theming
 * Full functionality preserved: all nav links, logout, mobile overlay
 */
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE CONFIG  — each role gets its own colour identity
───────────────────────────────────────────────────────────────────────────── */
const ROLE_CONFIG = {
  user: {
    gradient: "linear-gradient(135deg,#2dce7a,#0ea55e)",
    accent: "#2dce7a",
    accentDark: "#076b3c",
    activeBg: "rgba(45,206,122,0.12)",
    activeBorder: "rgba(45,206,122,0.3)",
    activeColor: "#076b3c",
    pillBg: "rgba(45,206,122,0.12)",
    pillColor: "#076b3c",
    label: "Individual",
  },
  issuer: {
    gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    accent: "#3b82f6",
    accentDark: "#1d4ed8",
    activeBg: "rgba(59,130,246,0.12)",
    activeBorder: "rgba(59,130,246,0.3)",
    activeColor: "#1d4ed8",
    pillBg: "rgba(59,130,246,0.12)",
    pillColor: "#1d4ed8",
    label: "Issuer",
  },
  verifier: {
    gradient: "linear-gradient(135deg,#f43f5e,#be123c)",
    accent: "#f43f5e",
    accentDark: "#be123c",
    activeBg: "rgba(244,63,94,0.1)",
    activeBorder: "rgba(244,63,94,0.3)",
    activeColor: "#be123c",
    pillBg: "rgba(244,63,94,0.1)",
    pillColor: "#be123c",
    label: "Verifier",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   NAV LINKS PER ROLE
───────────────────────────────────────────────────────────────────────────── */
const NAV = {
  user: [
    { to: "/dashboard", emoji: "🏠", label: "Dashboard" },
    { to: "/wallet", emoji: "👜", label: "My Wallet" },
    { to: "/upload", emoji: "⬆️", label: "Upload Credential" },
    { to: "/digilocker", emoji: "📱", label: "DigiLocker Vault" },
    { to: "/ai-assistant", emoji: "🤖", label: "AI Assistant" },
  ],
  issuer: [
    { to: "/issuer/dashboard", emoji: "🏠", label: "Dashboard" },
    { to: "/issuer/queue", emoji: "📋", label: "Verification Queue" },
    { to: "/issuer/history", emoji: "🕑", label: "Issued History" },
  ],
  verifier: [
    { to: "/verifier/dashboard", emoji: "🔍", label: "Verify Credentials" },
    { to: "/verifier/logs", emoji: "📊", label: "Verification Logs" },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   SINGLE NAV ITEM
───────────────────────────────────────────────────────────────────────────── */
function NavItem({ to, emoji, label, rc, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <NavLink to={to} onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={({ isActive }) => ({
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px", borderRadius: 14,
        textDecoration: "none", cursor: "pointer",
        transition: "all 0.18s ease",
        background: isActive
          ? rc.activeBg
          : hov ? "rgba(255,255,255,0.5)" : "transparent",
        border: isActive
          ? `1.5px solid ${rc.activeBorder}`
          : "1.5px solid transparent",
        transform: hov && !isActive ? "translateX(3px)" : "translateX(0)",
        boxShadow: isActive
          ? `0 4px 14px ${rc.accent}22`
          : "none",
      })}>
      {({ isActive }) => (
        <>
          {/* Emoji icon box */}
          <div style={{
            width: 34, height: 34, borderRadius: 11, flexShrink: 0,
            background: isActive
              ? rc.gradient
              : hov ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)",
            border: isActive
              ? "none"
              : "1.5px solid rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
            boxShadow: isActive
              ? `0 4px 12px ${rc.accent}33`
              : "none",
            transition: "all 0.18s ease",
          }}>
            {emoji}
          </div>

          {/* Label */}
          <span style={{
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: isActive ? 800 : 600,
            fontSize: 13.5,
            color: isActive ? rc.activeColor : "#5a7d6a",
            transition: "color 0.18s, font-weight 0.18s",
            flex: 1,
          }}>
            {label}
          </span>

          {/* Active indicator dot */}
          {isActive && (
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: rc.accent, flexShrink: 0,
              boxShadow: `0 0 0 3px ${rc.accent}28`,
            }} />
          )}
        </>
      )}
    </NavLink>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SIDEBAR CONTENT
───────────────────────────────────────────────────────────────────────────── */
function SidebarContent({ user, rc, links, onLogout, onClose }) {
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div style={{
      width: 256, height: "100%",
      display: "flex", flexDirection: "column",
      background: "rgba(247,253,249,0.92)",
      backdropFilter: "blur(24px) saturate(180%)",
      borderRight: "1px solid rgba(255,255,255,0.55)",
      boxShadow: "4px 0 32px rgba(7,107,60,0.08)",
    }}>

      {/* ── LOGO ────────────────────────────────────────────────────── */}
      <div style={{
        padding: "20px 18px 16px",
        borderBottom: "1px solid rgba(45,206,122,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(145deg,#2dce7a,#076b3c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 19, color: "white", fontWeight: 800,
            boxShadow: "0 6px 16px rgba(45,206,122,0.32), inset 0 1px 0 rgba(255,255,255,0.28)",
          }}>✦</div>
          <div>
            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 17,
              color: "#043d22", lineHeight: 1.1, letterSpacing: "-0.02em"
            }}>TrustBridge</p>
            <p style={{
              fontSize: 10, fontWeight: 700, color: "#0ea55e",
              letterSpacing: "0.09em", lineHeight: 1
            }}>CREDENTIAL PLATFORM</p>
          </div>
        </div>
      </div>

      {/* ── USER CARD ───────────────────────────────────────────────── */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{
          background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(255,255,255,0.65)",
          borderRadius: 18, padding: "13px 14px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 16px rgba(7,107,60,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: 13, flexShrink: 0,
              background: rc.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, color: "white",
              boxShadow: `0 4px 12px ${rc.accent}33`,
            }}>{initials}</div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13.5,
                color: "#043d22", overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", marginBottom: 3
              }}>
                {user?.name || "User"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 100,
                  background: rc.pillBg, color: rc.pillColor,
                  border: `1px solid ${rc.accent}22`,
                  textTransform: "capitalize",
                }}>{rc.label}</span>
                {user?.twoFactorEnabled && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px",
                    borderRadius: 100, background: "rgba(45,206,122,0.1)",
                    color: "#076b3c", border: "1px solid rgba(45,206,122,0.2)"
                  }}>
                    🔐 2FA
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAV LINKS ───────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "4px 10px 8px" }}>

        {/* Role label */}
        <p style={{
          fontSize: 10.5, fontWeight: 800, color: "rgba(90,125,106,0.55)",
          letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "8px 8px 6px", fontFamily: "'DM Sans',sans-serif"
        }}>
          NAVIGATION
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {links.map(({ to, emoji, label }) => (
            <NavItem key={to} to={to} emoji={emoji} label={label} rc={rc} onClick={onClose} />
          ))}
        </div>

        {/* Divider */}
        <div style={{
          margin: "12px 8px", height: 1,
          background: "rgba(45,206,122,0.12)"
        }} />

        {/* Live Radar — always shown */}
        <NavItem to="/radar" emoji="📡" label="Live Radar" rc={rc} onClick={onClose} />
      </nav>

      {/* ── BOTTOM: EMAIL + LOGOUT ───────────────────────────────────── */}
      <div style={{
        padding: "10px 10px 14px",
        borderTop: "1px solid rgba(45,206,122,0.1)"
      }}>

        {/* Email */}
        {user?.email && (
          <div style={{ padding: "8px 14px", marginBottom: 8 }}>
            <p style={{
              fontSize: 11, color: "rgba(90,125,106,0.6)", fontWeight: 500,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {user.email}
            </p>
          </div>
        )}

        {/* Logout */}
        <LogoutBtn onLogout={onLogout} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOGOUT BUTTON
───────────────────────────────────────────────────────────────────────────── */
function LogoutBtn({ onLogout }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onLogout}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px", borderRadius: 14, border: "none", cursor: "pointer",
        background: hov ? "rgba(239,68,68,0.08)" : "transparent",
        transition: "all 0.18s ease",
        transform: hov ? "translateX(3px)" : "translateX(0)",
      }}>
      <div style={{
        width: 34, height: 34, borderRadius: 11, flexShrink: 0,
        background: hov ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.5)",
        border: "1.5px solid rgba(255,255,255,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        transition: "all 0.18s",
      }}>🚪</div>
      <span style={{
        fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13.5,
        color: hov ? "#991b1b" : "#5a7d6a",
        transition: "color 0.18s",
      }}>Sign Out</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────────────────────────────────────────────── */
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const role = user?.role || "user";
  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const links = NAV[role] || NAV.user;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: "linear-gradient(170deg,#ffffff 0%,#f7fdf9 12%,#edfaf3 28%,#d4f5e2 55%,#a8edca 80%,#4dd99a 100%)",
      fontFamily: "'DM Sans',system-ui,sans-serif",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }

        /* Custom scrollbar for nav */
        nav::-webkit-scrollbar { width:3px; }
        nav::-webkit-scrollbar-track { background:transparent; }
        nav::-webkit-scrollbar-thumb { background:rgba(45,206,122,0.25); border-radius:99px; }

        /* Scrollable main content */
        .main-scroll::-webkit-scrollbar { width:5px; }
        .main-scroll::-webkit-scrollbar-track { background:transparent; }
        .main-scroll::-webkit-scrollbar-thumb { background:rgba(45,206,122,0.2); border-radius:99px; }

        @keyframes slideInLeft  { from{transform:translateX(-100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeIn       { from{opacity:0} to{opacity:1} }

        .sidebar-mobile-anim { animation:slideInLeft 0.28s cubic-bezier(.16,1,.3,1) both; }
        .overlay-anim        { animation:fadeIn 0.22s ease both; }

        @media (max-width:768px) {
          .desktop-sidebar { display:none !important; }
          .mobile-topbar   { display:flex !important; }
        }
        @media (min-width:769px) {
          .mobile-topbar   { display:none !important; }
        }
      `}</style>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
      <div className="desktop-sidebar" style={{ flexShrink: 0 }}>
        <SidebarContent
          user={user} rc={rc} links={links}
          onLogout={handleLogout} onClose={() => { }}
        />
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────────── */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          {/* Backdrop */}
          <div className="overlay-anim"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(4,62,34,0.35)", backdropFilter: "blur(4px)"
            }} />
          {/* Drawer */}
          <div className="sidebar-mobile-anim" style={{ position: "relative", zIndex: 1, height: "100%" }}>
            <SidebarContent
              user={user} rc={rc} links={links}
              onLogout={handleLogout} onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Mobile topbar */}
        <div className="mobile-topbar" style={{
          height: 60, padding: "0 18px", flexShrink: 0,
          background: "rgba(247,253,249,0.92)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(45,206,122,0.12)",
          alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 16px rgba(7,107,60,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(145deg,#2dce7a,#076b3c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: "white"
            }}>✦</div>
            <span style={{
              fontWeight: 800, fontSize: 16, color: "#043d22",
              letterSpacing: "-0.02em"
            }}>TrustBridge</span>
          </div>
          <button onClick={() => setMobileOpen(true)}
            style={{
              width: 38, height: 38, borderRadius: 12, border: "none",
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, color: "#076b3c",
              boxShadow: "0 2px 10px rgba(7,107,60,0.1)",
              transition: "all 0.18s"
            }}>
            ☰
          </button>
        </div>

        {/* Page content */}
        <main className="main-scroll" style={{
          flex: 1, overflowY: "auto", padding: "24px 28px",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
