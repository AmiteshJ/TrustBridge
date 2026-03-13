/**
 * User Dashboard
 */
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { credentialAPI, authAPI } from "../../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Wallet, Upload, ShieldCheck, Clock, XCircle, Link2,
  ArrowRight, ToggleLeft, ToggleRight, Loader2, BadgeCheck
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, to }) {
  const card = (
    <div className={`clay-card p-5 flex items-center gap-4 ${to ? "cursor-pointer" : ""}`}>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-clay-sm`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-emerald-900">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function UserDashboard() {
  const { user, updateUser } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState(false);

  useEffect(() => {
    credentialAPI.getWallet()
      .then(({ data }) => setCredentials(data.credentials || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total:    credentials.length,
    verified: credentials.filter(c => c.status === "verified").length,
    pending:  credentials.filter(c => c.status === "pending").length,
    rejected: credentials.filter(c => c.status === "rejected").length,
  };

  const handle2FAToggle = async () => {
    setToggling(true);
    try {
      const { data } = await authAPI.toggle2FA();
      updateUser({ twoFactorEnabled: data.twoFactorEnabled });
      toast.success(data.message);
    } catch {
      toast.error("Failed to toggle 2FA");
    } finally {
      setToggling(false);
    }
  };

  const recent = credentials.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
            <p className="text-emerald-100 mt-1">Manage your credential wallet and DigiLocker vault.</p>
          </div>
          <Link to="/upload" className="clay-button bg-white text-emerald-700 flex items-center gap-2 hover:bg-emerald-50 shadow-lg whitespace-nowrap"
            style={{ background: "white", color: "#059669" }}>
            <Upload className="w-4 h-4" /> Upload Credential
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={Wallet}     label="Total Credentials" value={counts.total}    color="from-emerald-400 to-teal-500"   to="/wallet" />
          <StatCard icon={ShieldCheck} label="Verified"          value={counts.verified} color="from-green-400 to-emerald-500"  to="/wallet" />
          <StatCard icon={Clock}       label="Pending"           value={counts.pending}  color="from-yellow-400 to-orange-400"  to="/wallet" />
          <StatCard icon={XCircle}     label="Rejected"          value={counts.rejected} color="from-red-400 to-rose-500"       to="/wallet" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent credentials */}
          <div className="clay-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-emerald-900 text-lg">Recent Credentials</h2>
              <Link to="/wallet" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-800">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-2xl" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-8">
                <BadgeCheck className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No credentials yet</p>
                <Link to="/upload" className="text-sm font-bold text-emerald-600 mt-2 inline-block">Upload your first →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(c => (
                  <div key={c._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-white/50">
                    <div className="overflow-hidden">
                      <p className="font-bold text-emerald-900 text-sm truncate">{c.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{c.category}</p>
                    </div>
                    <span className={`badge badge-${c.status}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security & Quick actions */}
          <div className="space-y-4">
            {/* 2FA toggle */}
            <div className="clay-card p-5">
              <h2 className="font-extrabold text-emerald-900 mb-3">Security</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-emerald-800">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add extra security to your account</p>
                </div>
                <button onClick={handle2FAToggle} disabled={toggling}
                  className="flex items-center gap-2 text-sm font-bold">
                  {toggling ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  ) : user?.twoFactorEnabled ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                  <span className={user?.twoFactorEnabled ? "text-emerald-600" : "text-gray-400"}>
                    {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                </button>
              </div>
            </div>

            {/* DigiLocker status */}
            <div className="clay-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    user?.digilockerLinked ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <Link2 className={`w-5 h-5 ${user?.digilockerLinked ? "text-blue-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-emerald-900">DigiLocker Vault</p>
                    <p className={`text-xs font-semibold ${user?.digilockerLinked ? "text-blue-600" : "text-gray-400"}`}>
                      {user?.digilockerLinked ? "✓ Linked" : "Not linked"}
                    </p>
                  </div>
                </div>
                <Link to="/digilocker" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  {user?.digilockerLinked ? "Open" : "Connect"} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Quick links */}
            <div className="clay-card p-5 space-y-2">
              <h2 className="font-extrabold text-emerald-900 mb-3">Quick Actions</h2>
              {[
                { to: "/upload",       label: "Upload New Credential", icon: Upload },
                { to: "/ai-assistant", label: "Ask AI Assistant",      icon: "🤖" },
                { to: "/verify",       label: "Verify a Credential",   icon: ShieldCheck },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 transition-colors group">
                  <span className="font-medium text-sm text-gray-700 group-hover:text-emerald-800">{label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
