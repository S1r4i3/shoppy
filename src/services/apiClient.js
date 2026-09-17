import { config } from './config';

/** Simulates network latency so loading states are visible. */
export const delay = (ms = config.apiLatencyMs) => new Promise((r) => setTimeout(r, ms));

export async function simulate(fn) {
  await delay();
  return fn();
}
