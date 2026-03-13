/**
 * AI Controller
 * Groq-powered chat assistant and document analysis
 */
const { chatWithAssistant, analyzeDocument } = require("../services/groqService");
const Credential = require("../models/Credential");

// ─── AI Chat ──────────────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "messages array required" });
    }

    const userContext = {
      name: req.user.name,
      role: req.user.role,
      digilockerLinked: req.user.digilockerLinked,
    };

    const reply = await chatWithAssistant(messages, userContext);
    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("AI chat error:", err);
    return res.status(500).json({ success: false, message: "AI service unavailable" });
  }
};

// ─── Analyze Credential Document ─────────────────────────────────────────────
exports.analyzeCredential = async (req, res) => {
  try {
    const { credentialId, extractedText } = req.body;

    const credential = await Credential.findById(credentialId);
    if (!credential || credential.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Document text is too short for analysis" });
    }

    const analysis = await analyzeDocument(extractedText, credential.title);

    // Save analysis to credential
    credential.aiAnalysis = {
      analyzed: true,
      issues: analysis.issues || [],
      summary: analysis.summary || "",
      analyzedAt: new Date(),
    };
    await credential.save();

    return res.status(200).json({ success: true, analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ success: false, message: "AI analysis failed" });
  }
};
