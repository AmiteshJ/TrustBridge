/**
 * API Service – Axios instance + all API calls
 */
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("tb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:  (data)             => API.post("/auth/register",    data),
  login:     (data)             => API.post("/auth/login",       data),
  verifyOTP: (data)             => API.post("/auth/verify-otp",  data),
  resendOTP: (data)             => API.post("/auth/resend-otp",  data),
  toggle2FA: ()                 => API.post("/auth/toggle-2fa"),
  getMe:     ()                 => API.get("/auth/me"),
};

// ─── Credentials ──────────────────────────────────────────────────────────────
export const credentialAPI = {
  upload:              (formData) => API.post("/credentials/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getWallet:           ()         => API.get("/credentials/wallet"),
  getOne:              (id)       => API.get(`/credentials/${id}`),
  publicVerify:        (cid)      => API.get(`/credentials/verify/${cid}`),
  getVerifyHistory:    (id)       => API.get(`/credentials/${id}/verifications`),
};

// ─── Issuer ───────────────────────────────────────────────────────────────────
export const issuerAPI = {
  getQueue:    ()         => API.get("/issuer/queue"),
  getHistory:  ()         => API.get("/issuer/history"),
  getStats:    ()         => API.get("/issuer/stats"),
  approve:     (id, data) => API.put(`/issuer/approve/${id}`, data),
  reject:      (id, data) => API.put(`/issuer/reject/${id}`,  data),
  revoke:      (id, data) => API.put(`/issuer/revoke/${id}`,  data),
};

// ─── Verifier ─────────────────────────────────────────────────────────────────
export const verifierAPI = {
  verify:   (data) => API.post("/verifier/verify", data),
  getLogs:  ()     => API.get("/verifier/logs"),
};

// ─── DigiLocker ───────────────────────────────────────────────────────────────
export const digilockerAPI = {
  initiateLink:   (data) => API.post("/digilocker/initiate",       data),
  verifyAndLink:  (data) => API.post("/digilocker/verify",         data),
  syncCredential: (id)   => API.post(`/digilocker/sync/${id}`),
  getVault:       ()     => API.get("/digilocker/vault"),
  unlink:         ()     => API.post("/digilocker/unlink"),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat:    (messages)              => API.post("/ai/chat",    { messages }),
  analyze: (credentialId, text)    => API.post("/ai/analyze", { credentialId, extractedText: text }),
};

// ─── Radar ────────────────────────────────────────────────────────────────────
export const radarAPI = {
  getLiveActivity:   (limit) => API.get(`/radar/activity?limit=${limit || 20}`),
  getDashboardStats: ()      => API.get("/radar/stats"),
  getCategoryTrends: ()      => API.get("/radar/trends"),
  getTopIssuers:     ()      => API.get("/radar/issuers"),
  getActivityTimeline:()     => API.get("/radar/timeline"),
  getFraudAlerts:    ()      => API.get("/radar/fraud-alerts"),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:    ()     => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile", data),
};

export default API;
