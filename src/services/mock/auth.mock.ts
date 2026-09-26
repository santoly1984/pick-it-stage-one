import type { AuthService } from "@/services/contracts";
import { currentUser } from "@/mocks/data";
import type { User, UserRole } from "@/types";
import { delay } from "./util";

let session: User = { ...currentUser };

export const mockAuthService: AuthService = {
  async getCurrentUser() {
    return delay({ ...session });
  },
  async signInWithMock(role) {
    const roles: UserRole[] =
      role === "judge" ? ["judge"] : role === "admin" ? ["admin"] : ["fan", ...(role === "challenger" ? (["challenger"] as UserRole[]) : [])];
    session = { ...currentUser, roles };
    return delay({ ...session });
  },
  async signOut() {
    session = { ...currentUser };
    return delay(undefined);
  },
};
