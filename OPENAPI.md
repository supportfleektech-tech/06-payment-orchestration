# OpenAPI — Payment Orchestration (v1)
- GET /health
- GET|POST /payment-intents — {amountCents,purpose,reference} (idempotent via Idempotency-Key)
- POST /payment-intents/:id/attempt
- GET|POST /providers — {code,label,configEncrypted,priority?}
- POST /webhooks/mpesa — idempotent provider callback
