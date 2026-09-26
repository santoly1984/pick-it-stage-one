/** Simulated network latency so loading states are exercised. */
export function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export const nowIso = () => new Date().toISOString();

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
