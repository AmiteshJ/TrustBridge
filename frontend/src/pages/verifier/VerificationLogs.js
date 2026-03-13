/**
 * Verifier – Verification Logs
 */
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { verifierAPI } from "../../services/api";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

const resultIcon = {
  valid:     <CheckCircle className="w-4 h-4 text-emerald-500" />,
  invalid:   <XCircle className="w-4 h-4 text-red-500" />,
  tampered:  <AlertTriangle className="w-4 h-4 text-red-500" />,
  expired:   <Clock className="w-4 h-4 text-yellow-500" />,
  revoked:   <XCircle className="w-4 h-4 text-gray-500" />,
  not_found: <XCircle className="w-4 h-4 text-gray-400" />,
};

export default function VerificationLogs() {
  const [logs, setLogs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifierAPI.getLogs()
      .then(({ data }) => setLogs(data.logs || []))
      .catch(() => toast.error("Failed to load logs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-900">Verification Logs</h1>
          <p className="text-gray-500 text-sm mt-1">{logs.length} verification{logs.length !== 1 ? "s" : ""} performed</p>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : logs.length === 0 ? (
          <div className="clay-card p-16 text-center">
            <p className="text-gray-400 font-medium">No verifications yet</p>
          </div>
        ) : (
          <div className="clay-card divide-y divide-emerald-50">
            {logs.map((log, i) => (
              <div key={log._id || i} className="flex items-center justify-between p-4 first:rounded-t-[18px] last:rounded-b-[18px] hover:bg-emerald-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  {resultIcon[log.result] || resultIcon.invalid}
                  <div>
                    <p className="font-bold text-sm text-emerald-900">
                      {log.credential?.title || log.credentialId}
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.verificationMethod?.toUpperCase()} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.fraudDetected && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">FRAUD</span>}
                  <span className={`badge badge-${log.result === "valid" ? "verified" : "rejected"}`}>{log.result}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
