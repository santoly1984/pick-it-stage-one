/**
 * MOCK ROLE SESSION (demo only).
 *
 * Client-side role state used to exercise role-based UX and route gating.
 * This is NOT security: the real backend must verify roles server-side on
 * every admin/judge request. See AGENTS.md → "Follow-up: server authorization".
 */
import { useSyncExternalStore } from "react";
import type { UserRole } from "@/types";

export interface MockSession {
  userId: string;
  roles: UserRole[];
  hydrated: boolean;
}

const STORAGE_KEY = "pickit.demo.session";
const DEFAULT: MockSession = { userId: "u_me", roles: ["fan", "challenger"], hydrated: false };

/** Demo accounts: judge/admin are separate accounts, never self-selected at signup. */
export const DEMO_ACCOUNTS: Record<"fan" | "challenger" | "judge" | "admin", { userId: string; roles: UserRole[] }> = {
  fan: { userId: "u_me", roles: ["fan"] },
  challenger: { userId: "u_me", roles: ["fan", "challenger"] },
  judge: { userId: "u_judge1", roles: ["judge"] },
  admin: { userId: "u_admin", roles: ["admin"] },
};

let state: MockSession = DEFAULT;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getSession(): MockSession {
  return state;
}

/** Call once from a client effect (root). Reads persisted demo role. */
export function hydrateSession() {
  if (typeof window === "undefined" || state.hydrated) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Pick<MockSession, "userId" | "roles">) : null;
    state = { ...(parsed ?? DEFAULT), hydrated: true };
  } catch {
    state = { ...DEFAULT, hydrated: true };
  }
  emit();
}

export function setSession(next: Pick<MockSession, "userId" | "roles">) {
  state = { ...next, hydrated: true };
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

export function hasRole(role: UserRole, s: MockSession = state) {
  return s.roles.includes(role);
}

/** Service-boundary check used by privileged mock adapters. */
export function assertRole(role: UserRole) {
  if (!hasRole(role)) throw new Error(`FORBIDDEN: requires ${role} role`);
}

export function useSession(): MockSession {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => DEFAULT,
  );
}
