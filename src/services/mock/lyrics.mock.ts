/**
 * MOCK LYRICS ALIGNMENT
 * `requestAutoSync` fakes the AI forced-alignment job: processing -> review.
 * A real adapter posts the job and polls for the aligned lines.
 */
import type { LyricsService } from "@/services/contracts";
import { lyricsDocs, tracks } from "@/mocks/data";
import type { LyricsDocument } from "@/types";
import { assertRole } from "@/stores/session";
import { clone, delay, nowIso } from "./util";

function ensureDoc(trackId: string): LyricsDocument {
  let doc = lyricsDocs.find((d) => d.trackId === trackId);
  if (!doc) {
    doc = { trackId, status: "empty", canonicalText: "", lines: [], updatedAt: nowIso() };
    lyricsDocs.push(doc);
  }
  return doc;
}

function syncTrackStatus(doc: LyricsDocument) {
  const track = tracks.find((t) => t.id === doc.trackId);
  if (track) track.lyricsStatus = doc.status;
}

export const mockLyricsService: LyricsService = {
  async getLyrics(trackId) {
    return delay(clone(ensureDoc(trackId)));
  },
  async saveCanonicalText(trackId, text) {
    assertRole("admin");
    const doc = ensureDoc(trackId);
    doc.canonicalText = text;
    doc.status = text.trim() ? "draft" : "empty";
    doc.updatedAt = nowIso();
    syncTrackStatus(doc);
    return delay(clone(doc), 250);
  },
  async requestAutoSync(trackId) {
    assertRole("admin");
    const doc = ensureDoc(trackId);
    if (!doc.canonicalText.trim()) throw new Error("저장된 원본 가사가 없습니다.");
    doc.status = "processing";
    syncTrackStatus(doc);
    const lines = doc.canonicalText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const track = tracks.find((t) => t.id === trackId);
    const duration = track?.durationSec ?? 200;
    const step = lines.length ? Math.max(4, Math.round((duration - 12) / lines.length)) : 0;
    doc.lines = lines.map((text, i) => ({
      id: `l_${i + 1}`,
      startSec: 8 + i * step,
      endSec: 8 + (i + 1) * step,
      text,
    }));
    doc.status = "review";
    doc.updatedAt = nowIso();
    syncTrackStatus(doc);
    return delay(clone(doc), 1400);
  },
  async updateLines(trackId, lines) {
    assertRole("admin");
    const doc = ensureDoc(trackId);
    if (lines.some((l) => !Number.isFinite(l.startSec) || l.startSec < 0)) throw new Error("시작 시간이 올바르지 않습니다.");
    if (lines.some((l, i) => i > 0 && l.startSec <= lines[i - 1]!.startSec))
      throw new Error("타임스탬프는 앞 줄보다 커야 합니다.");
    doc.lines = lines.map((l, i) => ({ ...l, endSec: lines[i + 1]?.startSec ?? l.endSec ?? l.startSec + 4 }));
    if (doc.status === "published") doc.status = "review";
    doc.updatedAt = nowIso();
    syncTrackStatus(doc);
    return delay(clone(doc), 200);
  },
  async publish(trackId) {
    assertRole("admin");
    const doc = ensureDoc(trackId);
    if (doc.status !== "review" || doc.lines.length === 0) throw new Error("자동 싱크 검수 단계에서만 공개할 수 있습니다.");
    doc.status = "published";
    doc.updatedAt = nowIso();
    syncTrackStatus(doc);
    return delay(clone(doc), 350);
  },
};
