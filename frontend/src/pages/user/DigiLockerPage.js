/**
 * DigiLocker Vault Page
 */
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { digilockerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Link2, Loader2, FileText, ShieldCheck, Unlink, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function DigiLockerPage() {
  const { user, updateUser } = useAuth();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("idle"); // idle | phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (user?.digilockerLinked) {
      digilockerAPI.getVault()
        .then(({ data }) => setVault(data.vault))
        .catch(() => { })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.digilockerLinked]);

  const initiateLink = async () => {
    if (!phone || phone.length < 10) { toast.error("Enter valid phone number"); return; }
    setWorking(true);
    try {
      await digilockerAPI.initiateLink({ phone });
      setStep("otp");
      toast("OTP sent to your email (simulating SMS) 📱");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setWorking(false);
    }
  };

  const verifyAndLink = async () => {
    if (!otp || otp.length !== 6) { toast.error("Enter 6-digit OTP"); return; }
    setWorking(true);
    try {
      await digilockerAPI.verifyAndLink({ otp });
      updateUser({ digilockerLinked: true });
      const { data } = await digilockerAPI.getVault();
      setVault(data.vault);
      setStep("idle");
      toast.success("DigiLocker linked successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setWorking(false);
    }
  };

  const unlink = async () => {
    if (!window.confirm("Unlink DigiLocker? Your vault data will be retained.")) return;
    setWorking(true);
    try {
      await digilockerAPI.unlink();
      updateUser({ digilockerLinked: false });
      setVault(null);
      toast("DigiLocker unlinked");
    } catch {
      toast.error("Failed to unlink");
    } finally {
      setWorking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-900">DigiLocker Vault</h1>
          <p className="text-gray-500 text-sm mt-1">Sync verified credentials to your secure DigiLocker vault</p>
        </div>

        {/* Status banner */}
        <div className={`clay-card p-5 flex items-center justify-between ${user?.digilockerLinked
            ? "border-blue-200"
            : "border-gray-200"
          }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-clay-sm ${user?.digilockerLinked ? "bg-blue-100" : "bg-gray-100"
              }`}>
              {user?.digilockerLinked ? "📱" : "🔗"}
            </div>
            <div>
              <h2 className="font-extrabold text-emerald-900">DigiLocker Account</h2>
              <p className={`text-sm font-semibold ${user?.digilockerLinked ? "text-blue-600" : "text-gray-400"}`}>
                {user?.digilockerLinked ? "✓ Linked & Active" : "Not Connected"}
              </p>
              {vault?.phone && <p className="text-xs text-gray-400">Phone: {vault.phone}</p>}
            </div>
          </div>
          {user?.digilockerLinked && (
            <button onClick={unlink} disabled={working}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50">
              <Unlink className="w-4 h-4" /> Unlink
            </button>
          )}
        </div>

        {/* Link flow */}
        {!user?.digilockerLinked && (
          <div className="clay-card p-6 space-y-5">
            <div>
              <h2 className="font-extrabold text-emerald-900 text-lg mb-1">Connect DigiLocker</h2>
              <p className="text-sm text-gray-500">Enter your phone number to verify and link your DigiLocker account.</p>
            </div>

            {step === "idle" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-emerald-800 mb-1">Phone Number</label>
                  <div className="flex gap-3">
                    <input value={phone} onChange={e => setPhone(e.target.value)}
                      className="clay-input" placeholder="+91 98765 43210" type="tel" />
                    <button onClick={initiateLink} disabled={working}
                      className="clay-button whitespace-nowrap flex items-center gap-2">
                      {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                      Send OTP
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
                  ℹ️ <strong>Simulation:</strong> OTP will be sent to your registered email address (simulating SMS delivery).
                </p>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">
                  OTP sent to your email. Check your inbox.
                </p>
                <div>
                  <label className="block text-sm font-bold text-emerald-800 mb-1">Enter OTP</label>
                  <div className="flex gap-3">
                    <input value={otp} onChange={e => setOtp(e.target.value)}
                      className="clay-input" placeholder="6-digit OTP" maxLength={6} />
                    <button onClick={verifyAndLink} disabled={working}
                      className="clay-button whitespace-nowrap flex items-center gap-2">
                      {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Verify
                    </button>
                  </div>
                </div>
                <button onClick={() => setStep("idle")} className="text-sm text-gray-400 hover:text-gray-600">
                  ← Change number
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vault documents */}
        {user?.digilockerLinked && (
          <div className="clay-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-emerald-900 text-lg">
                Vault Documents ({vault?.documents?.length || 0})
              </h2>
              <Link to="/wallet" className="text-sm font-bold text-emerald-600 hover:text-emerald-800">
                + Sync more →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
              </div>
            ) : !vault?.documents?.length ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📂</div>
                <p className="text-gray-500 font-medium">Your vault is empty</p>
                <p className="text-sm text-gray-400 mt-1">Go to your Wallet and sync verified credentials here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vault.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900 text-sm">{doc.title}</p>
                        <p className="text-xs text-gray-400">{doc.issuedBy} • {new Date(doc.syncedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-verified">{doc.status}</span>
                      <a href={doc.documentUrl} target="_blank" rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800">View</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
