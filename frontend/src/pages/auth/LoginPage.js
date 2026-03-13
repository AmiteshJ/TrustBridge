/**
 * Login Page
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BadgeCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      if (data.requiresOTP) {
        navigate("/verify-otp", { state: { userId: data.userId, email: form.email } });
        toast("OTP sent to your email 📧");
      } else {
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}! 🎉`);
        const paths = { issuer: "/issuer/dashboard", verifier: "/verifier/dashboard", user: "/dashboard" };
        navigate(paths[data.user.role] || "/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #f0fdf9, #d1fae5)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-clay">
            <BadgeCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-emerald-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to TrustBridge</p>
        </div>

        <form onSubmit={handleSubmit} className="clay-card p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-emerald-800 mb-2">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="clay-input" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-emerald-800 mb-2">Password</label>
            <div className="relative">
              <input name="password" type={showPw ? "text" : "password"} value={form.password}
                onChange={handleChange} className="clay-input pr-12" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="clay-button w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-800">Create one</Link>
        </p>
        <p className="text-center mt-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-emerald-600">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
