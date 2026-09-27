# PICK IT — 음악 발견·감상·투표 플랫폼 (Phase 1: UI + mock)

PICK IT은 범용 음악 오디션/투표 플랫폼입니다. "군 장병 음악 오디션"은 시즌 1 프로그램 콘텐츠일 뿐입니다.
이 저장소는 **UI, 앱 구조, 전역 플레이어, 역할별 흐름**만 구현하며 모든 데이터·권한·순위 계산은 **브라우저 메모리 mock**입니다.

## 실행

```sh
bun install        # 또는 npm i  (bun.lock 기준)
bun run dev        # vite dev → http://localhost:8080
npx tsgo --noEmit  # 타입 검사 (또는 npx tsc --noEmit)
bun run build      # vite build (Cloudflare Worker 대상 SSR 빌드)
bun run lint       # eslint
```

스택: TanStack Start v1 (React 19, Vite 7), Tailwind v4 (`src/styles.css` 토큰), TanStack Query, shadcn/ui.

## 폴더

```text
src/routes/        화면(파일 기반 라우트)  /welcome /home /ranking /artist/$id /player /judge/* /admin/* /demo/roles ...
src/features/      player, ranking, voting, artist, community, judging, admin
src/services/      contracts.ts (API 계약) + index.ts (어댑터 등록) + mock/*
src/mocks/data.ts  mock 원본 데이터 (메모리, 새로고침 시 초기화)
src/stores/        session.ts (mock 역할 세션, localStorage)
src/types/         도메인 타입 (User, Entry, RankingEntry, AdminRankingEntry, ResultStatus ...)
```

## mock 범위 (실제 구현 아님)

| 영역 | 현재 mock 동작 | 파일 |
|---|---|---|
| 역할/권한 | localStorage 세션 + `RoleGate` + `assertRole` (보안 아님) | `stores/session.ts`, `components/auth/RoleGate.tsx` |
| 투표/투표권 | 메모리 배열에 push, 결제·원장 없음 | `services/mock/voting.mock.ts` |
| 순위 엔진 | `computeRanking` 예시 수식 (live-vote / final) | `services/mock/ranking.mock.ts` |
| 결과 단계 | DRAFT→JUDGING→SCORED→REVIEW→CONFIRMED→PUBLISHED, 스냅샷 버전 기록 | `ranking.mock.ts` |
| 평가 규칙 | 라운드별 예시 비율, 시뮬레이션·초안·적용 (정책 승인 아님) | `services/mock/admin.mock.ts` |
| 심사 | 점수 저장 시 새 스냅샷 생성 + Admin 진행률 갱신 | `services/mock/judging.mock.ts` |
| 가사 싱크 | 원본 저장 → 균등 간격 가짜 정렬 → 타임스탬프 수정 → 검수 후 공개 | `services/mock/lyrics.mock.ts` |
| 커뮤니티 | 메모리 댓글/신고 | `services/mock/community.mock.ts` |

### 데모 음원·영상·가사

- `public/audio/demo-a.mp3`(20초), `demo-b.mp3`(18초), `demo-c.mp3`(16초): ffmpeg 사인파 화음으로 **직접 생성한 합성 instrumental**. 외부 음원·저작권 불분명 음악 없음.
- 현재 본선 `r_2`에 정확히 100명의 **가상 데모 참가자**(기존 8명 + 생성한 샘플 92명), 지난 라운드 `r_1`에 별도 4명의 기존 참가자가 있습니다. `r_1.entryIds`는 실제 `roundId`와 일치합니다. 데모 트랙은 곡별 ID/제목이 있으나 합성 음원 파일 3개를 돌려 씁니다(`mocks/data.ts` `AUDIO`). 플레이어는 **trackId 기준**으로 전환하므로 같은 파일이어도 곡을 고르면 0초부터 재생됩니다.
- 랭킹의 `TOP 10`은 1~10위, `TOP 100`은 1~100위를 모두 표시하고 10명 단위 이동 버튼으로 원하는 구간으로 스크롤합니다. 홈의 `TOP 100` 링크는 해당 보기로 바로 진입합니다. 모든 참가자 프로필과 음원은 검수용 가상 콘텐츠이며, 실제 출전자/실제 득표가 아닙니다.
- `public/video/interview-demo.webm`(6초, 테스트 패턴): 인터뷰 영상 자리 표시. 재생 시 음악 일시정지, 끝나면 이어서 재생.
- 가사는 `t_1`(첫 휴가)만 공개 상태이며 타임스탬프는 **UI 테스트용 균등 간격**입니다. 실제 보컬 정렬이 아니며 플레이어 화면에도 그렇게 표시됩니다.
- 로컬 교체: 실제 음원은 Track `audioUrl`(스토리지 URL), 가사는 `LyricsService`의 정렬 결과로 바꾸면 됩니다. 화면 수정은 필요 없습니다.

### 샘플 ID

`services/index.ts`의 `DEFAULT_AUDITION_ID`/`DEFAULT_ROUND_ID`/`DEFAULT_JUDGE_ID`는 **1차 샘플(오디션 1개, 진행 라운드 r_2, 심사위원 A)** 전제입니다. 투표는 항상 참가자의 `roundId`를 쓰고, 진행 중 라운드(`LIVE_VOTING_ROUND_ID`)가 아니면 버튼이 "투표 종료"로 막히고 서비스도 거부합니다. 여러 프로그램이 생기면 라운드 선택/현재 라운드 API로 교체하세요.

mock 상태는 **페이지 새로고침 시 초기화**됩니다. 흐름 검수는 앱 안에서 링크로 이동하며 하세요.

## 서비스 계약 (교체 지점)

화면은 `src/services`만 호출합니다. 실제 백엔드로 바꿀 때는 `src/services/index.ts`의 오른쪽 값을 HTTP 어댑터로 교체하고, `contracts.ts` 인터페이스를 그대로 구현하면 화면 수정이 필요 없습니다.

- `AuditionService` — 오디션/라운드/참가자. 공개 DTO(`PublicEntry`)는 **군종까지만**, 정확한 부대명 없음 (`mock/mappers.ts`).
- `RankingService`
  - `getPublicRanking` — 공개. `entryId/rank/previousRank/rankChange/updatedAt` + 이름/곡명/군종/커버만. 점수·가중치·정확한 부대 정보는 제외. `final`은 **PUBLISHED일 때 공개 시점 고정 스냅샷만** 반환. `mock/ranking.mock.ts`의 `baseVotes`/`computeRanking`은 결정적 샘플 계산이며 동률은 ID로 정렬하고, 순위 변동은 실제 투표 직전 순위와 비교합니다. 실제 연동 시 `services/index.ts`의 ranking/voting 어댑터와 `mocks/data.ts`의 샘플 명단을 대체하세요.
  - `getAdminRanking`, `getResultState`, `listSnapshots`, `startReview`, `cancelReview`, `confirmResult`, `publishResult` — Admin 전용.
- `VotingService` — 투표권 조회/투표. 투표 후 `rankingKeys.publicAll` 무효화로 Home/Ranking/Artist/Player가 같은 순위로 갱신.
- `JudgingService` — 심사위원 전용. 가중치는 보지 않음.
- `AdminService` — 진행률, 점수 조회, `simulateEvaluationRule`(저장 안 함), `saveEvaluationRuleDraft`(`draftWeights`만), `applyEvaluationRule`.
- `LyricsService` — `saveCanonicalText` → `requestAutoSync` → `updateLines` → `publish`(검수 단계에서만).

### 결과 단계 규칙

- DRAFT/JUDGING/SCORED는 제출된 심사 수로 자동 판정. 일부만 제출되면 Admin에 **잠정(provisional)** 표시, 검토·확정·공개 불가.
- REVIEW → CONFIRMED → PUBLISHED는 Admin이 버튼으로 한 단계씩 진행.
- 원본(심사 점수, 적용된 규칙)이 바뀌면 새 스냅샷 버전을 만들고, REVIEW/CONFIRMED는 풀립니다. PUBLISHED 이후 변경은 경고만 표시하고 공개 화면은 고정 스냅샷 유지.
- 순위 숫자를 직접 수정하는 기능은 없습니다.

## 역할 데모 (`/demo/roles`, 개발 전용)

| 계정 | 확인할 흐름 | 차단 |
|---|---|---|
| 팬 / 팬+참가자 | 듣기 → 투표 → 랭킹, 참가자는 `/apply` | `/judge`, `/admin` |
| 심사위원 | 라운드 → 참가자 → 평가 저장/다음 | `/admin` |
| 운영자 | 진행률 → 규칙 시뮬레이션·적용 → 검토·확정·공개, `/admin/lyrics` | — |

Judge/Admin은 가입 시 선택할 수 없습니다. `/demo/roles`는 실제 인증 도입 시 **삭제**해야 합니다.

## 검증 방법

1. `npx tsgo --noEmit`, `bun run build` 통과 확인.
2. 브라우저(390px)에서 `/demo/roles` → 팬으로 `/admin` 접근 시 "접근 권한이 없습니다".
3. 운영자 → 순위 관리: 2차 라운드가 "심사 중 · 잠정" (심사 298/300).
4. 심사위원 → 한도윤(e_1), 최민재(e_6) 평가 저장 → 운영자 화면이 "심사 완료", 스냅샷 버전 증가.
5. 검토 시작 → 결과 확정 → 공개(publish) → 팬 계정 랭킹의 최종 순위 공개 확인. 공개 화면에 점수·가중치·부대명 없음.
6. 플레이어: 홈 TOP10 재생 → 랭킹 → 플레이어 이동 중 끊김 없음, 이전/다음/일시정지/탐색, 곡 끝(16~20초) 자동 다음 곡, 재생 목록 탭, `첫 휴가` 가사 강조·자동 스크롤, 참가자 화면 인터뷰 영상 재생 시 음악 일시정지 → 영상 종료 후 재개.
7. 운영자 → 가사 싱크: 원본 저장 → 자동 싱크 → 시작 초 수정·저장 → 검수 완료·공개.

(위 3~6은 링크 이동으로 진행해야 합니다. 새로고침하면 mock 데이터가 초기화됩니다.)

## 남은 production 작업

- 실제 인증 + **서버 측 역할 검증**(모든 judge/admin 엔드포인트), `/demo/roles` 제거.
- DB 스키마와 행 단위 접근 제어, 감사 로그 영속화.
- 결제, 투표권 원장(TicketLedger), idempotency key, 이상 투표 탐지.
- 서버 순위/점수 엔진, 스냅샷 저장, 캐시/큐(Redis 등).
- 결과 확정 **2인 승인** 및 운영 가중치 승인 정책(현재 미정, mock 예시값만 존재).
- AI 가사 정렬(forced alignment) 작업 큐와 폴링.
- 실제 음원/영상 저장소, CI/CD, 테스트 자동화.
