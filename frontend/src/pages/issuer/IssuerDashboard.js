/**
 * Issuer Dashboard
 */
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { issuerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { ClipboardList, History, ShieldCheck, ArrowRight, Star } from "lucide-react";

export default function IssuerDashboard() {
  const { user }    = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuerAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const trustColor = { high: "text-emerald-600 bg-emerald-50", medium: "text-yellow-600 bg-yellow-50", low: "text-red-600 bg-red-50" };
  const tc = trustColor[stats?.trustLevel] || trustColor.medium;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="clay-card p-6" style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
          <h1 className="text-2xl font-extrabold text-white">Issuer Dashboard</h1>
          <p className="text-blue-100 mt-1">{user?.organization || user?.name}</p>
        </div>

        <div className="stats-grid">
          {[
            { label: "Pending Review",  value: loading ? "—" : stats?.pending,  color: "from-yellow-400 to-orange-400", icon: ClipboardList, to: "/issuer/queue" },
            { label: "Credentials Issued", value: loading ? "—" : stats?.issued, color: "from-emerald-400 to-teal-500",  icon: ShieldCheck,   to: "/issuer/history" },
            { label: "Revoked",         value: loading ? "—" : stats?.revoked,  color: "from-red-400 to-rose-500",     icon: History,        to: "/issuer/history" },
          ].map(({ label, value, color, icon: Icon, to }) => (
            <Link key={label} to={to} className="clay-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-clay-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-900">{value ?? "—"}</p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Reputation */}
        {stats && (
          <div className="clay-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-clay-sm">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-emerald-900 text-lg">Issuer Reputation</p>
                <p className="text-gray-500 text-sm">Based on issuance quality and revocations</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-extrabold text-emerald-700">{stats.reputationScore}%</p>
              <span className={`badge text-sm ${tc}`}>{stats.trustLevel} trust</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/issuer/queue" className="clay-card p-5 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-bold text-emerald-900">Verification Queue</p>
                <p className="text-xs text-gray-400">Review pending requests</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300" />
          </Link>
          <Link to="/issuer/history" className="clay-card p-5 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-900">Issued History</p>
                <p className="text-xs text-gray-400">All issued credentials</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
