/**
 * TrustBridge – Main App Router
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Public pages
import LandingPage      from "./pages/public/LandingPage";
import AboutPage        from "./pages/public/AboutPage";
import PublicVerifyPage from "./pages/public/PublicVerifyPage";

// Auth pages
import LoginPage        from "./pages/auth/LoginPage";
import RegisterPage     from "./pages/auth/RegisterPage";
import OTPPage          from "./pages/auth/OTPPage";

// User pages
import UserDashboard    from "./pages/user/UserDashboard";
import CredentialWallet from "./pages/user/CredentialWallet";
import UploadCredential from "./pages/user/UploadCredential";
import DigiLockerPage   from "./pages/user/DigiLockerPage";
import AIAssistantPage  from "./pages/user/AIAssistantPage";

// Issuer pages
import IssuerDashboard  from "./pages/issuer/IssuerDashboard";
import VerificationQueue from "./pages/issuer/VerificationQueue";
import IssuedHistory    from "./pages/issuer/IssuedHistory";

// Verifier pages
import VerifierDashboard from "./pages/verifier/VerifierDashboard";
import VerificationLogs  from "./pages/verifier/VerificationLogs";

// Radar
import RadarDashboard   from "./pages/radar/RadarDashboard";

import "../src/styles/index.css";

// ─── Protected Route wrapper ──────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<LandingPage />} />
      <Route path="/about"   element={<AboutPage />} />
      <Route path="/verify"  element={<PublicVerifyPage />} />
      <Route path="/verify/:credentialId" element={<PublicVerifyPage />} />
      <Route path="/radar"   element={<RadarDashboard />} />

      {/* Auth */}
      <Route path="/login"    element={user ? <Navigate to={getDashboardPath(user.role)} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={getDashboardPath(user.role)} /> : <RegisterPage />} />
      <Route path="/verify-otp" element={<OTPPage />} />

      {/* User */}
      <Route path="/dashboard"   element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
      <Route path="/wallet"      element={<ProtectedRoute allowedRoles={["user"]}><CredentialWallet /></ProtectedRoute>} />
      <Route path="/upload"      element={<ProtectedRoute allowedRoles={["user"]}><UploadCredential /></ProtectedRoute>} />
      <Route path="/digilocker"  element={<ProtectedRoute allowedRoles={["user"]}><DigiLockerPage /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute allowedRoles={["user"]}><AIAssistantPage /></ProtectedRoute>} />

      {/* Issuer */}
      <Route path="/issuer/dashboard" element={<ProtectedRoute allowedRoles={["issuer"]}><IssuerDashboard /></ProtectedRoute>} />
      <Route path="/issuer/queue"     element={<ProtectedRoute allowedRoles={["issuer"]}><VerificationQueue /></ProtectedRoute>} />
      <Route path="/issuer/history"   element={<ProtectedRoute allowedRoles={["issuer"]}><IssuedHistory /></ProtectedRoute>} />

      {/* Verifier */}
      <Route path="/verifier/dashboard" element={<ProtectedRoute allowedRoles={["verifier"]}><VerifierDashboard /></ProtectedRoute>} />
      <Route path="/verifier/logs"      element={<ProtectedRoute allowedRoles={["verifier"]}><VerificationLogs /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function getDashboardPath(role) {
  if (role === "issuer")   return "/issuer/dashboard";
  if (role === "verifier") return "/verifier/dashboard";
  return "/dashboard";
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "14px",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(16,185,129,0.2)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              color: "#064e3b",
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
