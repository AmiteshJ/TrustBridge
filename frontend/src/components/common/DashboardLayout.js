/**
 * DashboardLayout – Sidebar + main content wrapper
 */
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Wallet, Upload, Link2, Bot, ClipboardList,
  History, ShieldCheck, FileSearch, Radio, LogOut, Menu, X,
  BadgeCheck, User, ChevronRight
} from "lucide-react";

const userLinks = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/wallet",       icon: Wallet,          label: "My Wallet" },
  { to: "/upload",       icon: Upload,          label: "Upload Credential" },
  { to: "/digilocker",   icon: Link2,           label: "DigiLocker Vault" },
  { to: "/ai-assistant", icon: Bot,             label: "AI Assistant" },
];

const issuerLinks = [
  { to: "/issuer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/issuer/queue",     icon: ClipboardList,   label: "Verification Queue" },
  { to: "/issuer/history",   icon: History,         label: "Issued History" },
];

const verifierLinks = [
  { to: "/verifier/dashboard", icon: ShieldCheck, label: "Verify Credentials" },
  { to: "/verifier/logs",      icon: FileSearch,  label: "Verification Logs" },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links =
    user?.role === "issuer"   ? issuerLinks :
    user?.role === "verifier" ? verifierLinks :
    userLinks;

  const roleColor = {
    user:     "bg-emerald-100 text-emerald-800",
    issuer:   "bg-blue-100 text-blue-800",
    verifier: "bg-purple-100 text-purple-800",
  }[user?.role] || "bg-gray-100 text-gray-700";

  const handleLogout = () => { logout(); navigate("/"); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-glass w-64 flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-mint-600 flex items-center justify-center shadow-clay-sm">
            <BadgeCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-800 text-emerald-900 text-lg leading-tight">TrustBridge</h1>
            <p className="text-xs text-emerald-600 font-medium">Credential Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 mx-3 mt-3 clay-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-emerald-900 truncate">{user?.name}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleColor}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-2 border-t border-emerald-100 mt-2">
          <NavLink
            to="/radar"
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Radio className="w-4 h-4 flex-shrink-0" />
            <span>Live Radar</span>
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-emerald-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 100%)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-emerald-900">TrustBridge</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-emerald-50">
            <Menu className="w-5 h-5 text-emerald-700" />
          </button>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
