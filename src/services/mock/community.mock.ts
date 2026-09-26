import type { CommunityService, NotificationService } from "@/services/contracts";
import { comments, currentUser, entries, notifications } from "@/mocks/data";
import type { Comment } from "@/types";
import { clone, delay, nowIso, uid } from "./util";

export const mockCommunityService: CommunityService = {
  async listComments(entryId) {
    const list = entryId ? comments.filter((c) => c.entryId === entryId) : comments;
    return delay(clone([...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt))));
  },
  async addComment({ entryId, body, parentId }) {
    const entry = entries.find((e) => e.id === entryId);
    const comment: Comment = {
      id: uid("c"),
      entryId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorRole: currentUser.roles.includes("challenger") ? "challenger" : "fan",
      isVerifiedChallenger: entry?.challengerId === currentUser.id,
      body,
      parentId,
      createdAt: nowIso(),
    };
    comments.push(comment);
    return delay(clone(comment), 250);
  },
  async report(commentId) {
    const c = comments.find((x) => x.id === commentId);
    if (c) c.reported = true;
    return delay(undefined, 250);
  },
};

export const mockNotificationService: NotificationService = {
  async list(userId) {
    return delay(clone(notifications.filter((n) => n.userId === userId)));
  },
};
