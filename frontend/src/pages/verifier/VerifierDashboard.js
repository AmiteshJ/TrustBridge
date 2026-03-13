/**
 * Verifier Dashboard – Credential Verification Tool
 */
import React, { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { verifierAPI } from "../../services/api";
import toast from "react-hot-toast";
import { ShieldCheck, Search, Loader2, AlertTriangle, CheckCircle, XCircle, Clock, Ban, HelpCircle } from "lucide-react";

const resultConfig = {
  valid:     { icon: CheckCircle, color: "emerald", label: "Valid & Authentic",    bg: "bg-emerald-50 border-emerald-200" },
  invalid:   { icon: XCircle,     color: "red",     label: "Invalid Credential",   bg: "bg-red-50 border-red-200" },
  tampered:  { icon: AlertTriangle, color: "red",   label: "⚠️ Tampering Detected", bg: "bg-red-50 border-red-200" },
  expired:   { icon: Clock,        color: "yellow", label: "Expired",              bg: "bg-yellow-50 border-yellow-200" },
  revoked:   { icon: Ban,          color: "gray",   label: "Revoked",              bg: "bg-gray-50 border-gray-200" },
  not_found: { icon: HelpCircle,   color: "gray",   label: "Not Found",            bg: "bg-gray-50 border-gray-200" },
};

export default function VerifierDashboard() {
  const [credId, setCredId]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const verify = async () => {
    if (!credId.trim()) { toast.error("Enter a Credential ID"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await verifierAPI.verify({ credentialId: credId.trim() });
      setResult(data);
    } catch (err) {
      const msg = err.response?.data;
      if (msg) setResult(msg);
      else toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? resultConfig[result.result] || resultConfig.not_found : null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="clay-card p-6" style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
          <h1 className="text-2xl font-extrabold text-white">Credential Verification</h1>
          <p className="text-purple-100 mt-1">Instantly verify any TrustBridge credential</p>
        </div>

        {/* Search */}
        <div className="clay-card p-6">
          <label className="block text-sm font-bold text-emerald-800 mb-2">Enter Credential ID</label>
          <div className="flex gap-3">
            <input value={credId} onChange={e => setCredId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && verify()}
              className="clay-input" placeholder="e.g. TB-ABC123DEF456" />
            <button onClick={verify} disabled={loading}
              className="clay-button flex items-center gap-2 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Verify
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Credential IDs start with TB- followed by 12 characters</p>
        </div>

        {/* Result */}
        {result && cfg && (
          <div className={`clay-card p-6 border-2 ${cfg.bg} space-y-4 animate-slide-up`}>
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-${cfg.color}-100 flex items-center justify-center`}>
                <cfg.icon className={`w-6 h-6 text-${cfg.color}-600`} />
              </div>
              <div>
                <h2 className={`font-extrabold text-lg text-${cfg.color}-800`}>{cfg.label}</h2>
                {result.fraudDetected && (
                  <p className="text-sm font-bold text-red-600">🚨 {result.fraudDetails}</p>
                )}
              </div>
            </div>

            {/* Credential info */}
            {result.credential && (
              <div className="bg-white/70 rounded-2xl p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-gray-400 text-xs">Credential</p><p className="font-bold text-emerald-900">{result.credential.title}</p></div>
                  <div><p className="text-gray-400 text-xs">Category</p><p className="font-semibold capitalize">{result.credential.category}</p></div>
                  <div><p className="text-gray-400 text-xs">Owner</p><p className="font-semibold">{result.credential.owner?.name}</p></div>
                  <div><p className="text-gray-400 text-xs">Trust Score</p>
                    <p className={`font-extrabold text-base ${result.credential.trustScore >= 70 ? "text-emerald-600" : "text-yellow-600"}`}>
                      {result.credential.trustScore}%
                    </p>
                  </div>
                  {result.credential.issuer && (
                    <>
                      <div><p className="text-gray-400 text-xs">Issuer</p><p className="font-semibold">{result.credential.issuer.organization || result.credential.issuer.name}</p></div>
                      <div><p className="text-gray-400 text-xs">Issuer Trust</p>
                        <span className={`badge text-xs ${
                          result.credential.issuer.trustLevel?.includes("High") ? "badge-verified" :
                          result.credential.issuer.trustLevel?.includes("Low") ? "badge-rejected" : "badge-pending"
                        }`}>{result.credential.issuer.trustLevel}</span>
                      </div>
                    </>
                  )}
                  {result.credential.issuedAt && (
                    <div><p className="text-gray-400 text-xs">Issued</p><p className="font-semibold">{new Date(result.credential.issuedAt).toLocaleDateString()}</p></div>
                  )}
                  {result.credential.expiresAt && (
                    <div><p className="text-gray-400 text-xs">Expires</p><p className="font-semibold">{new Date(result.credential.expiresAt).toLocaleDateString()}</p></div>
                  )}
                </div>

                {result.credential.revocationReason && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl">Revocation reason: {result.credential.revocationReason}</p>
                )}
              </div>
            )}

            {/* AI Explanation */}
            {result.aiExplanation && (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-emerald-700 mb-1">🤖 AI Explanation</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.aiExplanation}</p>
              </div>
            )}

            {/* Credential ID */}
            {result.credential?.credentialId && (
              <p className="text-xs text-gray-400 font-mono">ID: {result.credential.credentialId}</p>
            )}
          </div>
        )}

        {/* Quick tips */}
        {!result && !loading && (
          <div className="clay-card p-5">
            <h3 className="font-bold text-emerald-800 mb-3">How to verify</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Ask the credential holder for their Credential ID (starts with <code className="bg-emerald-50 px-1 rounded font-mono text-xs">TB-</code>)</p>
              <p>2. Paste it in the field above and click Verify</p>
              <p>3. View full credential details, trust score, and AI explanation</p>
              <p>4. You can also use the verification link or QR code provided by the holder</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
