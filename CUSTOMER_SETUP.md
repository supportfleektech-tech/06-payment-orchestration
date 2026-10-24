# Payment Orchestration — Customer Setup
1. Create the organization and invite users with roles.
2. Seed reference/master data for your domain.
3. Wire integrations: set provider keys in `.env` (adapters throw until then).
4. Walk the primary flow end-to-end: payment intents, provider routing, retries, idempotent webhooks, ledger entries.
5. Review audit trail and dashboards.
6. Enable billing/subscription with the platform.
