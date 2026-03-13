/**
 * Register Page
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BadgeCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const roles = [
  { value: "user",     label: "👤 Individual",  desc: "Manage your own credentials" },
  { value: "issuer",   label: "🏛️ Issuer",       desc: "Verify & issue credentials" },
  { value: "verifier", label: "🔍 Verifier",     desc: "Verify credentials instantly" },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", organization: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      toast.success(`Welcome to TrustBridge, ${data.user.name}! 🎉`);
      const paths = { issuer: "/issuer/dashboard", verifier: "/verifier/dashboard", user: "/dashboard" };
      navigate(paths[data.user.role] || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #f0fdf9, #d1fae5)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-clay">
            <BadgeCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-emerald-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join TrustBridge today</p>
        </div>

        <form onSubmit={handleSubmit} className="clay-card p-8 space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-bold text-emerald-800 mb-2">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(({ value, label, desc }) => (
                <button type="button" key={value}
                  onClick={() => setForm({ ...form, role: value })}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    form.role === value
                      ? "border-emerald-500 bg-emerald-50 shadow-clay-sm"
                      : "border-gray-200 bg-white hover:border-emerald-300"
                  }`}>
                  <div className="text-lg mb-1">{label.split(" ")[0]}</div>
                  <div className="text-xs font-bold text-emerald-900">{label.split(" ")[1]}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-emerald-800 mb-2">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange}
              className="clay-input" placeholder="John Doe" required />
          </div>

          {(form.role === "issuer" || form.role === "verifier") && (
            <div>
              <label className="block text-sm font-bold text-emerald-800 mb-2">Organization Name</label>
              <input name="organization" value={form.organization} onChange={handleChange}
                className="clay-input" placeholder="e.g. University of Mumbai" required />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-emerald-800 mb-2">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="clay-input" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-emerald-800 mb-2">Password</label>
            <div className="relative">
              <input name="password" type={showPw ? "text" : "password"} value={form.password}
                onChange={handleChange} className="clay-input pr-12" placeholder="Min 8 characters" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="clay-button w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-800">Sign in</Link>
        </p>
        <p className="text-center mt-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-emerald-600">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
