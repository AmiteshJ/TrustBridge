/**
 * Issuer – Issued History
 */
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { issuerAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle } from "lucide-react";

function HistoryCard({ cred, onRevoke }) {
  const [showRevoke, setShowRevoke] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const revoke = async () => {
    if (!reason.trim()) { toast.error("Reason required"); return; }
    setLoading(true);
    try {
      await issuerAPI.revoke(cred._id, { reason });
      toast("Credential revoked");
      onRevoke(cred._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clay-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-emerald-900">{cred.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{cred.owner?.name} · {cred.owner?.email}</p>
          <p className="text-xs text-gray-400">Issued: {cred.issuedAt ? new Date(cred.issuedAt).toLocaleDateString() : "—"}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`badge badge-${cred.status}`}>{cred.status}</span>
          {cred.trustScore > 0 && <span className="text-xs font-bold text-emerald-600">Trust: {cred.trustScore}%</span>}
        </div>
      </div>

      {cred.status === "verified" && (
        <div>
          {!showRevoke ? (
            <button onClick={() => setShowRevoke(true)}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Revoke Credential
            </button>
          ) : (
            <div className="space-y-2 border-t border-red-100 pt-3">
              <input value={reason} onChange={e => setReason(e.target.value)}
                className="clay-input text-sm" placeholder="Revocation reason..." />
              <div className="flex gap-2">
                <button onClick={revoke} disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 flex items-center justify-center gap-1">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Confirm Revoke
                </button>
                <button onClick={() => setShowRevoke(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {cred.status === "revoked" && cred.revocationReason && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl">Reason: {cred.revocationReason}</p>
      )}
    </div>
  );
}

export default function IssuedHistory() {
  const [creds, setCreds]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuerAPI.getHistory()
      .then(({ data }) => setCreds(data.credentials || []))
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = (id) => {
    setCreds(prev => prev.map(c => c._id === id ? { ...c, status: "revoked" } : c));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-900">Issued Credentials History</h1>
          <p className="text-gray-500 text-sm mt-1">{creds.length} total credential{creds.length !== 1 ? "s" : ""}</p>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-clay" />)}</div>
        ) : creds.length === 0 ? (
          <div className="clay-card p-16 text-center">
            <p className="text-gray-400 font-medium">No credentials issued yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {creds.map(c => <HistoryCard key={c._id} cred={c} onRevoke={handleRevoke} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
