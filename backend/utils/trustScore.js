/**
 * Trust Score Calculator
 * Computes credential trust score from multiple factors
 */

/**
 * Calculate trust score for a credential
 * @param {Object} params
 * @param {Number} params.issuerReputation - 0-100
 * @param {Date} params.issuedAt
 * @param {Date|null} params.expiresAt
 * @param {Boolean} params.isRevoked
 * @param {Number} params.verificationCount
 * @returns {Number} trustScore 0-100
 */
exports.calculateTrustScore = ({
  issuerReputation = 80,
  issuedAt,
  expiresAt = null,
  isRevoked = false,
  verificationCount = 0,
}) => {
  if (isRevoked) return 0;

  let score = 0;

  // 1. Issuer reputation (40% weight)
  score += (issuerReputation / 100) * 40;

  // 2. Credential age factor (20% weight) – newer is better
  if (issuedAt) {
    const ageInDays = (Date.now() - new Date(issuedAt)) / (1000 * 60 * 60 * 24);
    const ageFactor = Math.max(0, 1 - ageInDays / (365 * 5)); // degrades over 5 years
    score += ageFactor * 20;
  } else {
    score += 10; // default
  }

  // 3. Expiry factor (20% weight)
  if (expiresAt) {
    const remaining = (new Date(expiresAt) - Date.now()) / (1000 * 60 * 60 * 24);
    if (remaining < 0) {
      score += 0; // expired
    } else if (remaining < 30) {
      score += 5;
    } else {
      score += 20;
    }
  } else {
    score += 15; // no expiry is ok
  }

  // 4. Verification popularity (20% weight)
  const popularityFactor = Math.min(1, verificationCount / 10);
  score += popularityFactor * 20;

  return Math.round(Math.min(100, Math.max(0, score)));
};

/**
 * Compute issuer reputation score
 */
exports.calculateIssuerReputation = ({ totalIssued, totalRevoked, verifiedCount }) => {
  if (totalIssued === 0) return 60; // default for new issuers

  const revocationRate = totalRevoked / totalIssued;
  const verificationRate = Math.min(1, verifiedCount / (totalIssued * 2));

  let score = 100;
  score -= revocationRate * 40; // penalise revocations
  score += verificationRate * 20; // reward verified usage
  score = Math.max(10, Math.min(100, score));

  return Math.round(score);
};

/**
 * Determine trust level string from reputation score
 */
exports.getTrustLevel = (score) => {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
};
