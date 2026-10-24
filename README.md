# Local Payment Orchestration

**Portfolio lane:** MEDIUM / REGULATED  
**Target time to first paid deployment:** 8–16 weeks for partner-led orchestration; 12–24+ months if becoming a licensed PSP

> Build a real, production-capable commercial product. Do not create demo-only flows, fake integrations, hard-coded records, placeholder APIs, or screenshot-level UI that cannot execute the underlying workflow.

## Mission
Unified payment abstraction for M-Pesa, cards, bank collections and payouts through licensed partners, with idempotency, reconciliation, webhooks, ledger references, dispute/audit controls and merchant reporting.

## Commercial model
SaaS + per-transaction orchestration fee under partner model; enterprise API pricing; reconciliation services.

## Dependencies / external gates
Licensed PSP/financial institution; CBK legal assessment; Daraja access; bank/aggregator contracts.

## Portfolio role
High strategic value, but should not block the early SaaS portfolio. Start as an integration/orchestration layer that does not custody customer funds.


## Definition of done
- Multi-tenant isolation is enforced server-side.
- Authentication, authorization, audit logging, rate limiting and error handling are production-grade.
- Primary customer workflow works end-to-end against real integrations or a documented partner sandbox.
- Data migrations are repeatable.
- Automated tests cover critical paths and failure cases.
- Observability, backups, rollback and incident procedures exist.
- Billing can charge a real customer.
- Production deployment is reproducible from a clean environment.
- Documentation is sufficient for a second engineer to operate the system.

## Build order
1. Validation and narrow ICP.
2. Domain model and tenant/security kernel.
3. Critical workflow.
4. Real integrations.
5. Billing + audit + notifications.
6. Hardening + observability.
7. Pilot with paid design partners.
8. General availability.

## Do not build yet
List non-essential features in `PRD.md` and explicitly defer them.
