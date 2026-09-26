# PICK IT roadmap

- [x] Scaffold: design system, types, mock services, global player, fan/judge/admin screens
- [x] (1) Public DTO: branch-level only on public screens
- [x] (2) Mock role session, /admin & /judge gates, demo-only role switch
- [x] (3) Vote -> shared public ranking invalidation; final hidden until judging complete + finalized
- [x] (4) Player: trackId switching, auto-next, error state, video focus
- [x] (5) Per-round evaluation rule, simulate -> review -> save draft
- [x] Verify typecheck + core flows

## Follow-ups (need backend / decisions)
- Real auth + server-side role checks (blocked: backend phase)
- Payment, ticket ledger, idempotency, abuse detection (blocked: backend phase)
- Real ranking/scoring engine, AI lyric alignment (blocked: backend phase)
- Evaluation weight approval policy and real values (blocked: operator decision)
