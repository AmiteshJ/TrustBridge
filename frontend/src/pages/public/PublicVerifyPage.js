/**
 * Public Credential Verification Page
 */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { credentialAPI } from "../../services/api";
import { BadgeCheck, Search, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function PublicVerifyPage() {
  const { credentialId: paramId } = useParams();
  const [credId, setCredId] = useState(paramId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult]  = useState(null);

  useEffect(() => {
    if (paramId) verify(paramId);
  }, [paramId]);

  const verify = async (id) => {
    const cid = (id || credId).trim();
    if (!cid) { toast.error("Enter a Credential ID"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await credentialAPI.publicVerify(cid);
      setResult(data);
    } catch (err) {
      setResult(err.response?.data || { success: false, result: "not_found" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #f0fdf9, #d1fae5)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50 px-6 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-emerald-900">TrustBridge</span>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-600">Verify Credential</span>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 pt-12 pb-16">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-clay animate-float">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-emerald-900">Verify a Credential</h1>
            <p className="text-gray-500 mt-2">Enter any TrustBridge Credential ID to verify its authenticity</p>
          </div>

          <div className="clay-card p-6">
            <div className="flex gap-3">
              <input value={credId} onChange={e => setCredId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && verify()}
                className="clay-input" placeholder="TB-XXXXXXXXXXXX" />
              <button onClick={() => verify()} disabled={loading}
                className="clay-button flex items-center gap-2 whitespace-nowrap">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Verify
              </button>
            </div>
          </div>

          {result && (
            <div className={`clay-card p-6 space-y-4 animate-slide-up ${
              result.result === "valid" ? "border-emerald-300" : "border-red-200"
            }`}>
              <div className="flex items-center gap-3">
                {result.result === "valid"
                  ? <CheckCircle className="w-8 h-8 text-emerald-500" />
                  : result.result === "tampered"
                  ? <AlertTriangle className="w-8 h-8 text-red-500" />
                  : <XCircle className="w-8 h-8 text-red-400" />
                }
                <div>
                  <h2 className={`font-extrabold text-lg ${result.result === "valid" ? "text-emerald-700" : "text-red-700"}`}>
                    {result.result === "valid" ? "✅ Credential Verified"
                     : result.result === "tampered" ? "⚠️ Tampering Detected"
                     : result.result === "expired" ? "⏰ Credential Expired"
                     : result.result === "revoked" ? "🚫 Credential Revoked"
                     : "❌ Credential Invalid"}
                  </h2>
                  <p className="text-sm text-gray-500">Verified at {new Date().toLocaleString()}</p>
                </div>
              </div>

              {result.credential && (
                <div className="bg-white/70 rounded-2xl p-4 space-y-2 text-sm">
                  <p><span className="text-gray-400">Title:</span> <strong>{result.credential.title}</strong></p>
                  {result.credential.issuer && <p><span className="text-gray-400">Issuer:</span> <strong>{result.credential.issuer.organization || result.credential.issuer.name}</strong></p>}
                  <p><span className="text-gray-400">Owner:</span> <strong>{result.credential.owner?.name}</strong></p>
                  <p><span className="text-gray-400">Trust Score:</span> <strong className="text-emerald-600">{result.credential.trustScore}%</strong></p>
                  {result.credential.issuedAt && <p><span className="text-gray-400">Issued:</span> <strong>{new Date(result.credential.issuedAt).toLocaleDateString()}</strong></p>}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-sm text-gray-400">
            Powered by <Link to="/" className="font-bold text-emerald-600">TrustBridge</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

// Fix missing import
function ShieldCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
