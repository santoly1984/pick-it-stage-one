import type { PublicEntry } from "@/types";

/** Participant story told as one flow: 소개 → 참가 계기 → 선곡 이유. */
export function StoryFlow({ entry }: { entry: PublicEntry }) {
  const steps = [
    { label: "소개", body: entry.intro },
    { label: "참가 계기", body: entry.motivation },
    { label: "선곡 이유", body: entry.songReason },
  ].filter((s) => s.body);

  return (
    <ol className="space-y-6">
      {steps.map((s, i) => (
        <li key={s.label}>
          <p className="text-xs font-semibold text-primary">
            {String(i + 1).padStart(2, "0")} · {s.label}
          </p>
          <p className="mt-1.5 text-[15px] leading-7">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
