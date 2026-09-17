// Non-secret runtime configuration. Values can be overridden with Vite env vars (.env).
const positive = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback; // ignores empty / invalid values
};

export const config = {
  apiLatencyMs: positive(import.meta.env.VITE_API_LATENCY_MS, 400),
  // Idle timeout: the session is extended while the user is active.
  sessionTtlMinutes: positive(import.meta.env.VITE_SESSION_TTL_MINUTES, 30),
  resetCodeTtlMinutes: 10,
  deliveryFee: 49,
  freeDeliveryThreshold: 999,
  taxRate: 0.05,
};
