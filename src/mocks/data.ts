/**
 * In-memory mock dataset. Replace with real API responses later —
 * the service layer (`src/services`) is the only consumer of this module.
 */
import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";
import cover4 from "@/assets/cover-4.jpg";
import participant1 from "@/assets/participant-01.jpg.asset.json";
import participant2 from "@/assets/participant-02.jpg.asset.json";
import participant3 from "@/assets/participant-03.jpg.asset.json";
import participant4 from "@/assets/participant-04.jpg.asset.json";
import participant5 from "@/assets/participant-05.jpg.asset.json";
import participant6 from "@/assets/participant-06.jpg.asset.json";
import participant7 from "@/assets/participant-07.jpg.asset.json";
import participant8 from "@/assets/participant-08.jpg.asset.json";
import participant9 from "@/assets/participant-09.jpg.asset.json";

import type {
  Audition,
  AuditLog,
  Comment,
  Entry,
  EvaluationRule,
  JudgeScore,
  LyricsDocument,
  MilitaryBranch,
  Notification,
  Round,
  TicketBalance,
  Track,
  User,
  Vote,
} from "@/types";

export const COVERS = [cover1, cover2, cover3, cover4];
// Uploaded sample portraits are shared across the 100 fictional demo entries.
const PORTRAITS = [participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, participant9].map((asset) => asset.url);

const AUDIO = [
  // Locally generated synthetic instrumentals (ffmpeg sine chords, no third-party music).
  // Demo only: tracks share 3 files; the player still switches by trackId.
  "/audio/demo-a.mp3",
  "/audio/demo-b.mp3",
  "/audio/demo-c.mp3",
];

const UNITS: { unit: string; branch: MilitaryBranch }[] = [
  { unit: "육군 제3보병사단", branch: "육군" },
  { unit: "해군 제1함대", branch: "해군" },
  { unit: "공군 제11전투비행단", branch: "공군" },
  { unit: "해병대 제2사단", branch: "해병대" },
  { unit: "육군 수도기계화사단", branch: "육군" },
  { unit: "국군지원사령부", branch: "국직" },
];

const NAMES = [
  "강태오",
  "윤시후",
  "박정민",
  "이건우",
  "서준혁",
  "최민재",
  "한도윤",
  "임재현",
  "노승우",
  "정하람",
  "오세진",
  "백지훈",
];

const TAGLINES = [
  "연병장에서 쓴 첫 자작곡",
  "위병소 앞에서 부르던 노래",
  "전역까지 D-102, 목소리로 남기는 기록",
  "훈련 끝, 마이크 앞에서",
  "누나에게 보내는 편지",
  "새벽 근무 중 떠오른 멜로디",
];

export const currentUser: User = {
  id: "u_me",
  displayName: "보원",
  handle: "@bowon",
  roles: ["fan", "challenger"],
  unit: "육군 제3보병사단",
  createdAt: "2026-01-04T09:00:00.000Z",
};

export const users: User[] = [
  currentUser,
  { id: "u_judge1", displayName: "심사위원 A", handle: "@judge_a", roles: ["judge"], createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "u_judge2", displayName: "심사위원 B", handle: "@judge_b", roles: ["judge"], createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "u_judge3", displayName: "심사위원 C", handle: "@judge_c", roles: ["judge"], createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "u_admin", displayName: "운영자", handle: "@admin", roles: ["admin"], createdAt: "2026-01-01T00:00:00.000Z" },
];

export const tracks: Track[] = NAMES.map((name, i) => ({
  id: `t_${i + 1}`,
  title: ["첫 휴가", "야간 근무", "편지", "다시 봄", "복무일지", "네 이름", "새벽 5시", "돌아갈 자리", "먼지", "사이렌", "수요일", "전역일"][i]!,
  artistName: name,
  audioUrl: AUDIO[i % AUDIO.length]!,
  coverUrl: PORTRAITS[i % PORTRAITS.length]!,
  durationSec: [20, 18, 16][i % 3]!, // matches the local demo file
  lyricsStatus: i === 0 ? "published" : i === 1 ? "review" : "draft",
}));

/** Fictional sample profiles only. Replace this fixture with the real round feed in the service adapter. */
const demoNames = ["김도현", "이서윤", "정우진", "박하린", "최유진", "한지우", "오민서", "송지호", "임소연", "문태윤", "배수아", "윤하늘"];
const demoSongs = ["파란 새벽", "우리의 계절", "밤의 편지", "다른 길", "마지막 여름", "작은 불빛", "먼 곳에서", "잠들지 않는 밤", "나의 하루", "다시 노래", "비 오는 창", "첫 번째 무대"];
const demoNumbers = Array.from({ length: 92 }, (_, i) => i + 13);
tracks.push(...demoNumbers.map((n, i) => ({
  id: `t_${n}`, title: `${demoSongs[i % demoSongs.length]} · 데모 ${String(i + 1).padStart(2, "0")}`,
  artistName: `${demoNames[i % demoNames.length]} ${String(Math.floor(i / demoNames.length) + 1).padStart(2, "0")}`,
  audioUrl: AUDIO[i % AUDIO.length]!, coverUrl: PORTRAITS[i % PORTRAITS.length]!,
  durationSec: [20, 18, 16][i % 3]!, lyricsStatus: "draft" as const,
})));

export const auditions: Audition[] = [
  {
    id: "a_1",
    title: "PICK IT 2026 시즌 1",
    subtitle: "군 장병 음악 오디션",
    status: "voting",
    coverUrl: COVERS[0]!,
    startsAt: "2026-08-01T00:00:00.000Z",
    endsAt: "2026-11-30T00:00:00.000Z",
    roundIds: ["r_1", "r_2"],
  },
];

export const rounds: Round[] = [
  {
    id: "r_1",
    auditionId: "a_1",
    name: "1차 라운드 · 예선",
    order: 1,
    status: "finalized",
    entryIds: NAMES.slice(8).map((_, i) => `e_${i + 9}`),
    votingOpensAt: "2026-08-10T00:00:00.000Z",
    votingClosesAt: "2026-09-10T00:00:00.000Z",
  },
  {
    id: "r_2",
    auditionId: "a_1",
    name: "2차 라운드 · 본선",
    order: 2,
    status: "live",
    entryIds: [...NAMES.slice(0, 8).map((_, i) => `e_${i + 1}`), ...demoNumbers.map((n) => `e_${n}`)],
    votingOpensAt: "2026-09-15T00:00:00.000Z",
    votingClosesAt: "2026-10-15T00:00:00.000Z",
  },
];

export const entries: Entry[] = NAMES.map((name, i) => ({
  id: `e_${i + 1}`,
  auditionId: "a_1",
  roundId: i < 8 ? "r_2" : "r_1",
  challengerId: i === 0 ? "u_me" : `u_c${i + 1}`,
  artistName: name,
  unit: UNITS[i % UNITS.length]!.unit,
  branch: UNITS[i % UNITS.length]!.branch,
  trackId: `t_${i + 1}`,
  interviewVideoUrl: "/video/interview-demo.webm",
  coverUrl: PORTRAITS[i % PORTRAITS.length]!,
  tagline: TAGLINES[i % TAGLINES.length]!,
  story:
    "입대 전에는 무대에 서는 일이 당연했습니다. 훈련소에서 3주가 지났을 때, 노래가 없는 하루가 얼마나 긴지 알게 됐어요.\n\n생활관 소등 후에 가사를 적었습니다. 처음에는 그냥 버티려고 쓴 글이었는데, 어느 순간 부대 동기들이 먼저 흥얼거리기 시작하더라고요. 이 곡은 그렇게 만들어졌습니다.\n\n지금 이 노래를 듣는 분들이, 각자의 자리에서 버티는 시간을 조금 덜 외롭게 보내면 좋겠습니다.",
  intro: `안녕하세요, ${name}입니다. 기타 한 대와 목소리로 이야기를 전하는 싱어송라이터예요.`,
  motivation: "노래가 없는 하루가 얼마나 긴지 알게 된 뒤, 제 노래가 누군가의 하루를 조금 짧게 만들 수 있다면 좋겠다고 생각해 지원했습니다.",
  songReason: "소등 후에 적은 가사로 만든 곡입니다. 동기들이 먼저 흥얼거리기 시작한 노래라, 가장 솔직한 제 목소리라고 생각해 골랐어요.",
  submittedAt: "2026-09-01T12:00:00.000Z",
}));
entries.push(...demoNumbers.map((n, i) => ({
  id: `e_${n}`, auditionId: "a_1", roundId: "r_2", challengerId: `u_demo_${n}`,
  artistName: tracks.find((t) => t.id === `t_${n}`)?.artistName ?? `데모 참가자 ${n}`,
  unit: "데모 소속 (가상)", branch: UNITS[i % UNITS.length]!.branch,
  trackId: `t_${n}`, coverUrl: PORTRAITS[i % PORTRAITS.length]!,
  tagline: "데모 무대 · 샘플 음악", story: "서비스 화면 검수를 위해 만든 가상 참가자와 합성 데모 음원입니다.",
  intro: "PICK IT 화면 검수용 가상 참가자입니다.", motivation: "데모 라운드의 탐색 흐름을 확인합니다.",
  songReason: "합성 음원으로 재생과 투표 흐름을 테스트합니다.", submittedAt: "2026-09-01T12:00:00.000Z",
})));

export const lyricsDocs: LyricsDocument[] = [
  {
    trackId: "t_1",
    status: "published",
    canonicalText: [
      "첫 휴가 나가는 날 아침",
      "군화 끈을 두 번 고쳐 매고",
      "창밖은 아직 어두운데",
      "내 마음만 먼저 도착해 있어",
      "역으로 가는 길 위에서",
      "네 이름을 몇 번이나 불렀는지",
      "돌아갈 걸 알면서도",
      "오늘만은 끝나지 않았으면",
      "말없이 웃던 네 얼굴",
      "그거 하나로 버틴 계절",
    ].join("\n"),
    lines: [
      "첫 휴가 나가는 날 아침",
      "군화 끈을 두 번 고쳐 매고",
      "창밖은 아직 어두운데",
      "내 마음만 먼저 도착해 있어",
      "역으로 가는 길 위에서",
      "네 이름을 몇 번이나 불렀는지",
      "돌아갈 걸 알면서도",
      "오늘만은 끝나지 않았으면",
      "말없이 웃던 네 얼굴",
      "그거 하나로 버틴 계절",
    ].map((text, i) => ({
      id: `l_${i + 1}`,
      // Demo timestamps for UI testing only — not aligned to any vocal.
      startSec: 1 + i * 1.8,
      endSec: 1 + (i + 1) * 1.8,
      text,
    })),
    updatedAt: "2026-09-20T02:00:00.000Z",
  },
];

export const ticketBalance: TicketBalance = {
  userId: "u_me",
  free: 3,
  standard: 12,
  freeResetsAt: "2026-09-27T00:00:00.000Z",
};

export const votes: Vote[] = [];

/**
 * EXAMPLE weights only (status: "example"). Operating policy is NOT decided;
 * admins may simulate and save drafts per round.
 */
export const evaluationRules: EvaluationRule[] = ["r_1", "r_2"].map((roundId) => ({
  id: `rule_${roundId}`,
  auditionId: "a_1",
  roundId,
  status: "example",
  voteWeight: 0.4,
  judgeWeight: 0.45,
  technicalWeight: 0.15,
  criteria: [
    { id: "vocal", label: "보컬 · 표현력", max: 40, description: "음정, 리듬, 전달력" },
    { id: "originality", label: "곡 완성도", max: 30, description: "작사/작곡, 편곡 완성도" },
    { id: "stage", label: "무대 매력", max: 20, description: "퍼포먼스, 몰입도" },
    { id: "story", label: "스토리 적합성", max: 10, description: "PICK IT 취지 부합" },
  ],
  updatedAt: "2026-09-10T00:00:00.000Z",
}));

export const criteria = evaluationRules[0]!.criteria;

function seededScore(seed: number, max: number) {
  return Math.round(((Math.sin(seed) + 1) / 2) * max * 0.35 + max * 0.6);
}

export const judgeScores: JudgeScore[] = entries.flatMap((entry, ei) =>
  ["u_judge1", "u_judge2", "u_judge3"].map((judgeId, ji) => ({
    id: `js_${entry.id}_${judgeId}`,
    roundId: entry.roundId,
    entryId: entry.id,
    judgeId,
    scores: Object.fromEntries(
      criteria.map((c, ci) => [c.id, seededScore(ei * 7 + ji * 3 + ci, c.max)]),
    ),
    ...(ji === 0 ? { comment: "가사 전달력이 좋고, 후반부 고음 처리에서 안정감이 있습니다." } : {}),
    // Generated demo rows are pre-submitted so the original two pending reviews remain testable.
    status: (ei < 8 && ji === 0 && ei % 5 === 0 ? "draft" : "submitted") as JudgeScore["status"],
    updatedAt: "2026-09-22T10:00:00.000Z",
  })),
);

export const comments: Comment[] = [
  {
    id: "c_1",
    entryId: "e_1",
    authorId: "u_f1",
    authorName: "지민맘",
    authorRole: "fan",
    isVerifiedChallenger: false,
    body: "새벽에 듣다가 울었어요. 무사 전역까지 응원합니다!",
    createdAt: "2026-09-23T13:20:00.000Z",
  },
  {
    id: "c_2",
    entryId: "e_1",
    authorId: "u_me",
    authorName: "강태오",
    authorRole: "challenger",
    isVerifiedChallenger: true,
    body: "들어주셔서 감사합니다. 다음 라운드에서 더 좋은 무대로 인사드릴게요.",
    createdAt: "2026-09-23T15:02:00.000Z",
    parentId: "c_1",
  },
  {
    id: "c_3",
    entryId: "e_2",
    authorId: "u_f2",
    authorName: "동기김상병",
    authorRole: "fan",
    isVerifiedChallenger: false,
    body: "생활관에서 진짜 이러고 부릅니다 ㅋㅋ 인정",
    createdAt: "2026-09-24T09:10:00.000Z",
  },
];

export const notifications: Notification[] = [
  {
    id: "n_1",
    userId: "u_me",
    kind: "ranking",
    title: "실시간 순위가 갱신됐어요",
    body: "응원 중인 강태오 님이 2위로 올라섰습니다.",
    createdAt: "2026-09-26T13:00:00.000Z",
  },
  {
    id: "n_2",
    userId: "u_me",
    kind: "vote",
    title: "무료 투표권 3장이 충전됐어요",
    body: "매일 자정에 무료 투표권이 충전됩니다.",
    createdAt: "2026-09-26T00:00:00.000Z",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "al_1",
    actorId: "u_admin",
    actorName: "운영자",
    action: "evaluation_rule.update",
    target: "rule_r_2",
    meta: { voteWeight: 0.4, judgeWeight: 0.45 },
    createdAt: "2026-09-10T00:12:00.000Z",
  },
  {
    id: "al_2",
    actorId: "u_admin",
    actorName: "운영자",
    action: "lyrics.publish",
    target: "t_1",
    createdAt: "2026-09-20T02:01:00.000Z",
  },
  {
    id: "al_3",
    actorId: "u_judge1",
    actorName: "심사위원 A",
    action: "judge_score.submit",
    target: "e_3",
    createdAt: "2026-09-22T10:00:00.000Z",
  },
];
