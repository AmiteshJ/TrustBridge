/**
 * Live Credential Radar Dashboard
 * Real-time ecosystem activity with charts
 */
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { radarAPI } from "../../services/api";
import { io } from "socket.io-client";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { BadgeCheck, Radio, AlertTriangle, ShieldCheck, Users, Building2, Activity } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const activityIcons = {
  credential_requested: "📤",
  credential_issued:    "✅",
  credential_verified:  "🔍",
  credential_revoked:   "🚫",
  fraud_detected:       "🚨",
  user_registered:      "👤",
  digilocker_synced:    "📱",
};

const activityColors = {
  credential_requested: "text-blue-600 bg-blue-50",
  credential_issued:    "text-emerald-600 bg-emerald-50",
  credential_verified:  "text-teal-600 bg-teal-50",
  credential_revoked:   "text-orange-600 bg-orange-50",
  fraud_detected:       "text-red-600 bg-red-50",
  user_registered:      "text-purple-600 bg-purple-50",
  digilocker_synced:    "text-indigo-600 bg-indigo-50",
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="clay-card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-clay-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
      </div>
      <p className="text-3xl font-extrabold text-emerald-900">{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function RadarDashboard() {
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [trends, setTrends]     = useState([]);
  const [issuers, setIssuers]   = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [liveCount, setLiveCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Fetch all data
    const fetchAll = async () => {
      const [s, a, tr, iss, tl, fa] = await Promise.allSettled([
        radarAPI.getDashboardStats(),
        radarAPI.getLiveActivity(25),
        radarAPI.getCategoryTrends(),
        radarAPI.getTopIssuers(),
        radarAPI.getActivityTimeline(),
        radarAPI.getFraudAlerts(),
      ]);
      if (s.status === "fulfilled")  setStats(s.value.data.stats);
      if (a.status === "fulfilled")  setActivity(a.value.data.activities || []);
      if (tr.status === "fulfilled") setTrends(tr.value.data.trends || []);
      if (iss.status === "fulfilled") setIssuers(iss.value.data.issuers || []);
      if (tl.status === "fulfilled") setTimeline(tl.value.data.timeline || []);
      if (fa.status === "fulfilled") setFraudAlerts(fa.value.data.alerts || []);
    };
    fetchAll();

    // Socket.io connection for real-time updates
    const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000");
    socketRef.current = socket;
    socket.emit("join:radar");

    socket.on("activity:new", (newActivity) => {
      setActivity(prev => [newActivity, ...prev].slice(0, 25));
      setLiveCount(c => c + 1);
      // Update stats
      setStats(prev => {
        if (!prev) return prev;
        const updates = { ...prev };
        if (newActivity.activityType === "credential_issued") updates.verifiedCredentials++;
        if (newActivity.activityType === "credential_verified") updates.totalVerifications++;
        if (newActivity.activityType === "fraud_detected") updates.fraudCount++;
        return updates;
      });
    });

    return () => socket.disconnect();
  }, []);

  // Category Doughnut chart
  const categoryLabels = trends.map(t => t._id || "other");
  const categoryCounts = trends.map(t => t.count);
  const donutData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryCounts,
      backgroundColor: ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#84cc16"],
      borderWidth: 0,
    }],
  };

  // Timeline Line chart – aggregate per day
  const days = [...new Set(timeline.map(t => t._id?.date))].sort();
  const issuedSeries  = days.map(d => timeline.find(t => t._id?.date === d && t._id?.type === "credential_issued")?.count  || 0);
  const verifSeries   = days.map(d => timeline.find(t => t._id?.date === d && t._id?.type === "credential_verified")?.count || 0);
  const lineData = {
    labels: days.map(d => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })),
    datasets: [
      { label: "Issued",     data: issuedSeries,  borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.1)", fill: true, tension: 0.4, pointRadius: 4 },
      { label: "Verified",   data: verifSeries,   borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)", fill: true, tension: 0.4, pointRadius: 4 },
    ],
  };

  const chartOpts = { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 100%)" }}>
      {/* Topbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-emerald-900">TrustBridge</span>
          </Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-700">Live Radar</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {liveCount > 0 && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
              +{liveCount} live
            </span>
          )}
          <Link to="/login" className="clay-button text-sm">Dashboard →</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-900">Live Credential Radar</h1>
          <p className="text-gray-500 mt-1">Real-time ecosystem activity across the TrustBridge network</p>
        </div>

        {/* Stats grid */}
        <div className="stats-grid">
          <StatCard icon={BadgeCheck}  label="Total Credentials"  value={stats?.totalCredentials}   color="from-emerald-400 to-teal-500"  sub={`${stats?.verifiedCredentials || 0} verified`} />
          <StatCard icon={ShieldCheck} label="Verifications"      value={stats?.totalVerifications}  color="from-blue-400 to-indigo-500"   sub="all time" />
          <StatCard icon={Users}       label="Users"              value={stats?.totalUsers}           color="from-purple-400 to-violet-500" />
          <StatCard icon={Building2}   label="Issuers"            value={stats?.totalIssuers}         color="from-yellow-400 to-orange-400" />
          <StatCard icon={Activity}    label="Pending"            value={stats?.pendingCredentials}   color="from-orange-400 to-red-400"    sub="awaiting review" />
          <StatCard icon={AlertTriangle} label="Fraud Alerts"     value={stats?.fraudCount}           color="from-red-400 to-rose-500"      sub="detected" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live activity feed */}
          <div className="lg:col-span-1 clay-card p-5 flex flex-col" style={{ maxHeight: "480px" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <h2 className="font-extrabold text-emerald-900">Live Activity Feed</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activity.length === 0 ? (
                <p className="text-gray-400 text-sm text-center pt-8">Waiting for activity...</p>
              ) : activity.map((a, i) => (
                <div key={a._id || i} className={`flex items-start gap-2 p-3 rounded-2xl ${activityColors[a.activityType] || "bg-gray-50 text-gray-600"}`}>
                  <span className="text-base flex-shrink-0">{activityIcons[a.activityType] || "📋"}</span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{a.credentialTitle || a.activityType.replace(/_/g, " ")}</p>
                    <p className="text-xs opacity-70">{a.actorName} • {new Date(a.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Line chart */}
          <div className="lg:col-span-2 clay-card p-5">
            <h2 className="font-extrabold text-emerald-900 mb-4">7-Day Activity Timeline</h2>
            {days.length > 0
              ? <Line data={lineData} options={chartOpts} />
              : <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No timeline data yet</div>
            }
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category donut */}
          <div className="clay-card p-5">
            <h2 className="font-extrabold text-emerald-900 mb-4">Credential Categories</h2>
            {trends.length > 0
              ? <div className="max-w-xs mx-auto"><Doughnut data={donutData} options={{ ...chartOpts, scales: undefined }} /></div>
              : <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data yet</div>
            }
          </div>

          {/* Top Issuers */}
          <div className="clay-card p-5">
            <h2 className="font-extrabold text-emerald-900 mb-4">Top Issuers</h2>
            {issuers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center pt-8">No issuers yet</p>
            ) : (
              <div className="space-y-3">
                {issuers.slice(0, 6).map((iss, i) => (
                  <div key={iss._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold flex items-center justify-center">{i+1}</span>
                      <div>
                        <p className="font-bold text-sm text-emerald-900">{iss.organization || iss.name}</p>
                        <p className="text-xs text-gray-400">{iss.issuerProfile?.totalIssued || 0} issued</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-emerald-600">{iss.issuerProfile?.reputationScore || 0}%</p>
                      <span className={`text-xs font-bold capitalize ${
                        iss.issuerProfile?.trustLevel === "high" ? "text-emerald-600" :
                        iss.issuerProfile?.trustLevel === "low"  ? "text-red-500" : "text-yellow-600"
                      }`}>{iss.issuerProfile?.trustLevel || "medium"} trust</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fraud alerts */}
        {fraudAlerts.length > 0 && (
          <div className="clay-card p-5 border-2 border-red-200 bg-red-50/30">
            <h2 className="font-extrabold text-red-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Recent Fraud Alerts
            </h2>
            <div className="space-y-2">
              {fraudAlerts.slice(0, 5).map((alert, i) => (
                <div key={alert._id || i} className="flex items-center justify-between p-3 bg-white/70 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm text-red-800">{alert.credential?.title || "Unknown Credential"}</p>
                    <p className="text-xs text-red-500">{alert.fraudDetails || "Hash mismatch detected"}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
