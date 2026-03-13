/**
 * Credential Wallet Page
 */
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { credentialAPI, digilockerAPI } from "../../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Upload, ShieldCheck, Clock, XCircle, AlertTriangle,
  Cloud, CloudOff, Copy, QrCode, ExternalLink, Loader2, BadgeCheck, Filter
} from "lucide-react";

function TrustRing({ score }) {
  const r = 32, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="trust-ring" style={{ width: 72, height: 72 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "36px 36px" }} />
      </svg>
      <div className="score-label" style={{ color }}>{score}%</div>
    </div>
  );
}

function CredentialCard({ cred, onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied]   = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(cred.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sync = async () => {
    setSyncing(true);
    try {
      await digilockerAPI.syncCredential(cred._id);
      toast.success("Synced to DigiLocker!");
      onSync(cred._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const statusIcon = { verified: "✅", pending: "⏳", rejected: "❌", revoked: "🚫" }[cred.status] || "📋";

  return (
    <div className="clay-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{statusIcon}</span>
            <h3 className="font-extrabold text-emerald-900 text-base truncate">{cred.title}</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 capitalize">
            {cred.category} • {cred.metadata?.institution || cred.issuer?.organization || "Pending Issuer"}
          </p>
        </div>
        {cred.status === "verified" && <TrustRing score={cred.trustScore || 0} />}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`badge badge-${cred.status}`}>{cred.status}</span>
        {cred.syncedToDigiLocker && (
          <span className="badge" style={{ background: "#dbeafe", color: "#1e40af" }}>
            📱 DigiLocker
          </span>
        )}
        {cred.issuer && (
          <span className="badge" style={{ background: "#f0fdf4", color: "#065f46" }}>
            🏛️ {cred.issuer.name}
          </span>
        )}
      </div>

      {cred.status === "verified" && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>Issued: <span className="font-semibold text-emerald-700">{new Date(cred.issuedAt).toLocaleDateString()}</span></p>
          {cred.expiresAt && <p>Expires: <span className="font-semibold">{new Date(cred.expiresAt).toLocaleDateString()}</span></p>}
        </div>
      )}

      {cred.status === "rejected" && cred.rejectionReason && (
        <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{cred.rejectionReason}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button onClick={copy}
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
          <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy ID"}
        </button>
        {cred.status === "verified" && (
          <>
            <a href={cred.verificationUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
              <ExternalLink className="w-3 h-3" /> Verify Link
            </a>
            {!cred.syncedToDigiLocker && (
              <button onClick={sync} disabled={syncing}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
                Sync to DigiLocker
              </button>
            )}
          </>
        )}
        <a href={cred.documentUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
          View Doc
        </a>
      </div>
    </div>
  );
}

export default function CredentialWallet() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");

  useEffect(() => {
    credentialAPI.getWallet()
      .then(({ data }) => setCredentials(data.credentials || []))
      .catch(() => toast.error("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, []);

  const handleSync = (id) => {
    setCredentials(prev => prev.map(c => c._id === id ? { ...c, syncedToDigiLocker: true } : c));
  };

  const filtered = filter === "all" ? credentials : credentials.filter(c => c.status === filter);
  const counts = {
    all:      credentials.length,
    verified: credentials.filter(c => c.status === "verified").length,
    pending:  credentials.filter(c => c.status === "pending").length,
    rejected: credentials.filter(c => c.status === "rejected").length,
    revoked:  credentials.filter(c => c.status === "revoked").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-900">My Credential Wallet</h1>
            <p className="text-gray-500 text-sm mt-1">{counts.all} total • {counts.verified} verified</p>
          </div>
          <Link to="/upload" className="clay-button flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload New
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all",      label: `All (${counts.all})` },
            { key: "verified", label: `Verified (${counts.verified})` },
            { key: "pending",  label: `Pending (${counts.pending})` },
            { key: "rejected", label: `Rejected (${counts.rejected})` },
            { key: "revoked",  label: `Revoked (${counts.revoked})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                filter === key
                  ? "bg-emerald-500 text-white shadow-clay-sm"
                  : "bg-white/70 text-gray-600 hover:bg-emerald-50"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-48 rounded-clay" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="clay-card p-16 text-center">
            <BadgeCheck className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">No credentials found</p>
            <Link to="/upload" className="clay-button inline-flex items-center gap-2 mt-4">
              <Upload className="w-4 h-4" /> Upload Your First Credential
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(cred => (
              <CredentialCard key={cred._id} cred={cred} onSync={handleSync} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
