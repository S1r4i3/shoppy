// Non-secret runtime configuration. Values can be overridden with Vite env vars (.env).
export const config = {
  apiLatencyMs: Number(import.meta.env.VITE_API_LATENCY_MS ?? 400),
  sessionTtlMinutes: Number(import.meta.env.VITE_SESSION_TTL_MINUTES ?? 30),
  resetCodeTtlMinutes: 10,
  deliveryFee: 49,
  freeDeliveryThreshold: 999,
  taxRate: 0.05,
};
