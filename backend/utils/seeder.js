/**
 * TrustBridge Database Seeder
 * Creates demo users (user, issuer, verifier) and sample activity logs
 * Run: node utils/seeder.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Credential = require("../models/Credential");
const { ActivityLog } = require("../models/Logs");
const connectDB = require("../config/db");

const seed = async () => {
  await connectDB();
  console.log("🌱 Seeding TrustBridge database...\n");

  // Clear existing
  await User.deleteMany({});
  await Credential.deleteMany({});
  await ActivityLog.deleteMany({});

  // ── Create demo issuer ─────────────────────────────────────────────────────
  const issuer = await User.create({
    name: "University of Mumbai",
    email: "issuer@demo.com",
    password: "Password123!",
    role: "issuer",
    organization: "University of Mumbai",
    issuerProfile: {
      category: "university",
      reputationScore: 92,
      trustLevel: "high",
      totalIssued: 120,
      totalRevoked: 3,
      verifiedCount: 85,
    },
  });
  console.log("✅ Issuer created:", issuer.email);

  // ── Create demo verifier ───────────────────────────────────────────────────
  const verifier = await User.create({
    name: "TechCorp HR",
    email: "verifier@demo.com",
    password: "Password123!",
    role: "verifier",
    organization: "TechCorp Solutions Ltd.",
  });
  console.log("✅ Verifier created:", verifier.email);

  // ── Create demo user ───────────────────────────────────────────────────────
  const user = await User.create({
    name: "Arjun Sharma",
    email: "user@demo.com",
    password: "Password123!",
    role: "user",
    twoFactorEnabled: false,
  });
  console.log("✅ User created:", user.email);

  // ── Create sample activity logs ────────────────────────────────────────────
  const activities = [
    { activityType: "user_registered",      actorName: "Arjun Sharma",          location: "Mumbai, India" },
    { activityType: "credential_requested", actorName: "Arjun Sharma",          credentialTitle: "B.Tech CSE Degree",  category: "education" },
    { activityType: "credential_issued",    actorName: "University of Mumbai",   credentialTitle: "B.Tech CSE Degree",  category: "education", issuerName: "University of Mumbai" },
    { activityType: "credential_verified",  actorName: "TechCorp HR",            credentialTitle: "B.Tech CSE Degree",  category: "education", issuerName: "University of Mumbai" },
    { activityType: "credential_requested", actorName: "Priya Mehta",            credentialTitle: "AWS Solutions Architect", category: "certification" },
    { activityType: "credential_issued",    actorName: "AWS Training Institute", credentialTitle: "AWS Solutions Architect", category: "certification", issuerName: "AWS Training Institute" },
    { activityType: "digilocker_synced",    actorName: "Arjun Sharma",          credentialTitle: "B.Tech CSE Degree",  category: "education" },
  ];

  for (const act of activities) {
    await ActivityLog.create({
      ...act,
      userId: user._id,
      issuerId: issuer._id,
    });
  }
  console.log(`✅ ${activities.length} activity logs created`);

  console.log("\n🎉 Seeding complete!\n");
  console.log("Demo Accounts:");
  console.log("─────────────────────────────────────");
  console.log("👤 User     → user@demo.com     / Password123!");
  console.log("🏛️  Issuer   → issuer@demo.com   / Password123!");
  console.log("🔍 Verifier → verifier@demo.com / Password123!");
  console.log("─────────────────────────────────────\n");

  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeder error:", err);
  process.exit(1);
});
