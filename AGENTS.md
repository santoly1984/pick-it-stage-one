<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## PICK IT architecture rules
- Screens call only `src/services` (contracts.ts + mock adapters registered in services/index.ts); swap adapters, not UI. Why: backend replaces mocks later.
- Public DTOs (`PublicEntry`, `RankingEntry`) expose branch (군종) only, never exact unit/score; built only in `services/mock/mappers.ts` / ranking `toPublic`. Why: military location privacy and score confidentiality.
- Ranking/scoring is computed only by RankingService (mock engine now); frontend never computes ranks. `final` public ranking is unpublished until judging completes and admin finalizes. Why: live-vote and final are separate concepts.
- All public ranking reads use `features/ranking/queries.ts` keys (`["ranking","public",...]`); mutations that affect votes invalidate `rankingKeys.publicAll`. Why: one invalidation refreshes Home/Ranking/Artist/Player.
- One global audio element in `features/player/PlayerProvider.tsx` mounted in __root; switching is keyed by trackId; videos take/release audio focus via suspendForVideo/releaseVideoFocus. Why: playback persists across routes.
- Roles use the client mock session `stores/session.ts` + `RoleGate` + `assertRole` in privileged mock services. This is NOT security. Follow-up: server-side authorization for every judge/admin endpoint. Judge/admin are never self-selected; `/demo/roles` is demo-only and must be removed with real auth.
- Evaluation weights are per-round `EvaluationRule` with status example|draft|approved; mock values are examples. Admin flow: adjust → simulate (no persist) → review → save draft. Approval policy is undefined.
