import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0fdf9, #d1fae5)" }}>
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-emerald-900">TrustBridge</span>
        </Link>
        <Link to="/register" className="clay-button text-sm">Get Started</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <h1 className="text-5xl font-extrabold text-emerald-900">About TrustBridge</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          TrustBridge is a universal credential verification platform that solves the fragmentation
          problem in modern digital ecosystems. Individuals repeatedly submit the same documents to
          different institutions because systems cannot communicate or verify across platforms.
        </p>
        <div className="clay-card p-6">
          <h2 className="text-xl font-extrabold text-emerald-900 mb-4">The Problem We Solve</h2>
          <ul className="space-y-3 text-gray-600">
            {["Repeated document submissions across institutions","High risk of credential fraud and tampering","No interoperability between education, employment, and finance platforms","Manual, slow verification processes"].map(p => (
              <li key={p} className="flex items-start gap-2"><span className="text-emerald-500 font-bold">→</span>{p}</li>
            ))}
          </ul>
        </div>
        <div className="clay-card p-6">
          <h2 className="text-xl font-extrabold text-emerald-900 mb-4">Our Solution</h2>
          <p className="text-gray-600 leading-relaxed">
            A unified ecosystem where credentials are <strong>verified once</strong> and can be
            <strong> securely reused</strong> across institutions. With cryptographic fraud detection,
            AI-powered analysis, DigiLocker integration, and real-time monitoring.
          </p>
        </div>
        <div className="text-center">
          <Link to="/register" className="clay-button inline-flex items-center gap-2 text-base px-8 py-3">
            Join TrustBridge <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
