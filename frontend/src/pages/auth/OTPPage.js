/**
 * OTP Verification Page – 2FA Login Step 2
 */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function OTPPage() {
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputsRef = useRef([]);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    inputsRef.current[0]?.focus();
  }, [userId, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length < 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ userId, otp: otpStr });
      login(data.token, data.user);
      toast.success("Verified! Welcome back 🎉");
      const paths = { issuer: "/issuer/dashboard", verifier: "/verifier/dashboard", user: "/dashboard" };
      navigate(paths[data.user.role] || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ userId });
      toast.success("New OTP sent to your email");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #f0fdf9, #d1fae5)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-clay animate-float">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-emerald-900">2FA Verification</h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit OTP sent to<br />
            <span className="font-bold text-emerald-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="clay-card p-8">
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputsRef.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-2xl font-extrabold rounded-2xl border-2 outline-none transition-all
                  ${digit
                    ? "border-emerald-500 bg-emerald-50 shadow-clay-sm text-emerald-700"
                    : "border-gray-200 bg-white text-gray-800"
                  } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200`}
              />
            ))}
          </div>

          <button type="submit" className="clay-button w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify OTP"}
          </button>

          <div className="mt-5 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">Resend OTP in <span className="font-bold text-emerald-600">{countdown}s</span></p>
            ) : (
              <button type="button" onClick={handleResend} disabled={resending}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 mx-auto">
                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Resend OTP
              </button>
            )}
          </div>
        </form>

        <p className="text-center mt-4 text-sm">
          <Link to="/login" className="text-gray-400 hover:text-emerald-600">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
