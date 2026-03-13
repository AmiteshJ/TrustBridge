/**
 * Groq AI Service
 * Document analysis, AI assistant, verification explanations
 */
const Groq = require("groq-sdk");

const getGroqClient = () =>
  new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama3-70b-8192";

// ─── General AI Assistant ─────────────────────────────────────────────────────
exports.chatWithAssistant = async (messages, userContext) => {
  const client = getGroqClient();

  const systemPrompt = `You are TrustBridge AI Assistant – a helpful, professional assistant embedded in the TrustBridge Universal Credential Verification Platform.

TrustBridge is a platform where:
- Users store verified credentials in a secure digital wallet
- Institutions (issuers) verify and issue credentials
- Organizations (verifiers) instantly verify credentials
- Documents can sync with a simulated DigiLocker vault

The current user context:
- Name: ${userContext?.name || "Unknown"}
- Role: ${userContext?.role || "user"}
- DigiLocker linked: ${userContext?.digilockerLinked ? "Yes" : "No"}

You help users with:
1. How to verify credentials
2. How to sync with DigiLocker
3. What their credentials mean
4. How to use the platform
5. Understanding trust scores and issuer reputation

Be concise, friendly, and accurate. Always stay within the context of TrustBridge.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    max_tokens: 600,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

// ─── Document Analysis ────────────────────────────────────────────────────────
exports.analyzeDocument = async (documentText, credentialTitle) => {
  const client = getGroqClient();

  const prompt = `You are a credential document analyst for TrustBridge. Analyze the following extracted text from a credential document titled "${credentialTitle}".

Document text:
${documentText}

Analyze for:
1. Missing required elements (signature, institution stamp, date, credential holder name)
2. Suspicious formatting or inconsistencies
3. Incomplete information
4. Overall assessment

Respond in JSON format with:
{
  "issues": ["issue 1", "issue 2"],  // empty array if none
  "summary": "brief summary of the document",
  "riskLevel": "low|medium|high",
  "recommendation": "approve|review|reject"
}

Return ONLY valid JSON, no markdown.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 400,
    temperature: 0.3,
  });

  try {
    const text = response.choices[0].message.content.trim();
    return JSON.parse(text);
  } catch {
    return {
      issues: [],
      summary: "Document analysis completed",
      riskLevel: "low",
      recommendation: "review",
    };
  }
};

// ─── Verification Explanation ─────────────────────────────────────────────────
exports.generateGroqExplanation = async (credential, result, fraudDetected) => {
  const client = getGroqClient();

  const statusDescriptions = {
    valid: "successfully verified and is authentic",
    invalid: "could not be verified",
    tampered: "shows signs of tampering",
    expired: "has expired",
    revoked: "has been revoked by the issuer",
    not_found: "was not found in the system",
  };

  const prompt = `Generate a brief, professional verification explanation for the following credential:

Credential: "${credential.title}"
Category: ${credential.category}
Issuer: ${credential.issuer?.organization || credential.issuer?.name || "Unknown Issuer"}
Status: ${result} – ${statusDescriptions[result] || result}
Trust Score: ${credential.trustScore}%
Fraud Detected: ${fraudDetected}

Write 2-3 sentences explaining the verification result in plain English for an organization verifying this credential. Be professional and factual.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.5,
  });

  return response.choices[0].message.content.trim();
};
