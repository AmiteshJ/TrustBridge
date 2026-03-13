/**
 * Issuer – Verification Queue
 */
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { issuerAPI } from "../../services/api";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, FileText, Loader2, ExternalLink, Calendar } from "lucide-react";

function QueueCard({ cred, onAction }) {
  const [loading, setLoading] = useState(null); // "approve" | "reject"
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes]   = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const approve = async () => {
    setLoading("approve");
    try {
      await issuerAPI.approve(cred._id, { notes, expiresAt: expiresAt || undefined });
      toast.success("Credential approved & issued!");
      onAction(cred._id, "approved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(null);
    }
  };

  const reject = async () => {
    if (!reason.trim()) { toast.error("Rejection reason required"); return; }
    setLoading("reject");
    try {
      await issuerAPI.reject(cred._id, { reason });
      toast("Credential rejected");
      onAction(cred._id, "rejected");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="clay-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-emerald-900 text-base">{cred.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{cred.category} • Submitted by <span className="font-semibold text-emerald-700">{cred.owner?.name}</span></p>
          <p className="text-xs text-gray-400">{cred.owner?.email}</p>
        </div>
        <span className="badge badge-pending flex-shrink-0">Pending</span>
      </div>

      {cred.metadata?.institution && (
        <div className="text-sm text-gray-600 bg-white/60 p-3 rounded-xl space-y-1">
          {cred.metadata.institution && <p>🏛️ <strong>Institution:</strong> {cred.metadata.institution}</p>}
          {cred.metadata.courseOrPosition && <p>📚 <strong>Course:</strong> {cred.metadata.courseOrPosition}</p>}
          {cred.metadata.grade && <p>⭐ <strong>Grade:</strong> {cred.metadata.grade}</p>}
          {cred.metadata.completionDate && <p>📅 <strong>Completed:</strong> {cred.metadata.completionDate}</p>}
        </div>
      )}

      {cred.description && <p className="text-sm text-gray-600">{cred.description}</p>}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Calendar className="w-3 h-3" />
        Submitted {new Date(cred.createdAt).toLocaleString()}
      </div>

      <a href={cred.documentUrl} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-800">
        <ExternalLink className="w-4 h-4" /> View Document
      </a>

      {/* Approve form */}
      <div className="space-y-3 border-t border-emerald-100 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1">Issuer Notes (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              className="clay-input text-sm" placeholder="Additional notes..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1">Expiry Date (optional)</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              className="clay-input text-sm" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={approve} disabled={!!loading}
            className="clay-button flex-1 flex items-center justify-center gap-2 py-2.5">
            {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve & Issue
          </button>
          <button onClick={() => setShowReject(!showReject)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>

        {showReject && (
          <div className="space-y-2">
            <input value={reason} onChange={e => setReason(e.target.value)}
              className="clay-input text-sm" placeholder="Rejection reason (required)" />
            <button onClick={reject} disabled={!!loading}
              className="w-full py-2 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Confirm Rejection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerificationQueue() {
  const [queue, setQueue]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuerAPI.getQueue()
      .then(({ data }) => setQueue(data.credentials || []))
      .catch(() => toast.error("Failed to load queue"))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (id) => {
    setQueue(prev => prev.filter(c => c._id !== id));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-900">Verification Queue</h1>
          <p className="text-gray-500 text-sm mt-1">{queue.length} pending request{queue.length !== 1 ? "s" : ""}</p>
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="skeleton h-56 rounded-clay" />)}</div>
        ) : queue.length === 0 ? (
          <div className="clay-card p-16 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-gray-500 font-medium text-lg">Queue is clear!</p>
            <p className="text-sm text-gray-400 mt-1">All credential requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map(c => <QueueCard key={c._id} cred={c} onAction={handleAction} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
