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
    doc.lines = lines;
    doc.updatedAt = nowIso();
    return delay(clone(doc), 200);
  },
  async publish(trackId) {
    assertRole("admin");
    const doc = ensureDoc(trackId);
    doc.status = "published";
    doc.updatedAt = nowIso();
    syncTrackStatus(doc);
    return delay(clone(doc), 350);
  },
};
