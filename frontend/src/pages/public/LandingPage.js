/**
 * Landing Page – TrustBridge hero + features
 */
import React from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck, ShieldCheck, Zap, Globe, ArrowRight,
  Lock, Radio, Bot, FileCheck, Users, Building2
} from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Verified Once, Trusted Always", desc: "Credentials verified once and reused securely across any institution or organization.", color: "from-emerald-400 to-teal-500" },
  { icon: Zap,         title: "Instant Verification",          desc: "Organizations verify credentials in seconds via ID, QR code, or direct link.",        color: "from-yellow-400 to-orange-400" },
  { icon: Lock,        title: "Fraud Detection",               desc: "Cryptographic hash verification detects document tampering automatically.",            color: "from-red-400 to-rose-500" },
  { icon: Globe,       title: "DigiLocker Integration",        desc: "Sync verified credentials to a simulated DigiLocker vault for government-grade storage.", color: "from-blue-400 to-indigo-500" },
  { icon: Bot,         title: "AI-Powered Assistant",          desc: "Groq AI analyzes documents, explains verification results, and guides users.",         color: "from-purple-400 to-violet-500" },
  { icon: Radio,       title: "Live Credential Radar",         desc: "Real-time ecosystem dashboard showing issuance, verifications, and fraud alerts.",     color: "from-pink-400 to-rose-400" },
];

const roles = [
  { icon: Users,     role: "Individual",  desc: "Store, manage, and share your verified credentials with any institution.",  link: "/register", color: "emerald" },
  { icon: Building2, role: "Issuer",      desc: "Verify and issue credentials as a university, company, or certification body.", link: "/register", color: "blue" },
  { icon: ShieldCheck, role: "Verifier",  desc: "Instantly verify the authenticity of any credential presented to you.",       link: "/register", color: "purple" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0fdf9 0%, #ecfdf5 50%, #d1fae5 100%)" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-clay-sm">
              <BadgeCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-900">TrustBridge</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link to="/about"  className="hover:text-emerald-700 transition-colors">About</Link>
            <Link to="/verify" className="hover:text-emerald-700 transition-colors">Verify</Link>
            <Link to="/radar"  className="hover:text-emerald-700 transition-colors">Live Radar</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors">Sign In</Link>
            <Link to="/register" className="clay-button text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-8 border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Universal Credential Verification Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-emerald-900 leading-tight mb-6">
          Verify Once.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Trust Everywhere.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          TrustBridge creates a unified digital credential ecosystem where your verified
          credentials are instantly trusted across education, employment, finance, and beyond.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/register" className="clay-button text-base px-8 py-3 flex items-center gap-2">
            Start for Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/verify" className="px-8 py-3 rounded-[14px] border-2 border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors">
            Verify a Credential
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[["10K+", "Credentials Issued"], ["500+", "Institutions"], ["99.9%", "Accuracy"]].map(([v, l]) => (
            <div key={l} className="clay-card p-4 text-center">
              <div className="text-2xl font-extrabold text-emerald-600">{v}</div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-extrabold text-emerald-900 text-center mb-12">
          Everything You Need for Credential Trust
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="clay-card p-6">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-clay-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-emerald-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-extrabold text-emerald-900 text-center mb-12">
          Built for Every Role
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ icon: Icon, role, desc, link, color }) => (
            <div key={role} className="clay-card p-6 text-center hover:scale-[1.02] transition-transform">
              <div className={`w-14 h-14 rounded-2xl bg-${color}-100 flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-7 h-7 text-${color}-600`} />
              </div>
              <h3 className="font-bold text-emerald-900 text-xl mb-2">{role}</h3>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">{desc}</p>
              <Link to={link} className="clay-button inline-flex items-center gap-2 text-sm">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-200 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BadgeCheck className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-emerald-800">TrustBridge</span>
        </div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} TrustBridge. Securing credentials, building trust.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <Link to="/verify" className="hover:text-emerald-700">Verify</Link>
          <Link to="/radar"  className="hover:text-emerald-700">Live Radar</Link>
          <Link to="/about"  className="hover:text-emerald-700">About</Link>
        </div>
      </footer>
    </div>
  );
}
