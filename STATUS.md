# Payment Orchestration — Status

## Completed
- [x] Multi-tenant kernel + RBAC + audit + api_keys
- [x] Payment providers, intents (idempotent), attempts, ledger
- [x] Idempotent webhook; audit on financial actions
- [x] Mobile-first UI (dashboard, providers, intents)
- [x] Prisma migration + seed + tests
- [x] Rate-limited, correlated API surface (`src/server/modules/http.ts`)
- [x] Dockerfile + Compose + CI
- [x] Smoke under `scripts/smoke.ts`; passes locally

## Next
- Real PSP adapters (Daraja/bank partners), reconciliation jobs
- Dispute/refund flows and ledger balancing
