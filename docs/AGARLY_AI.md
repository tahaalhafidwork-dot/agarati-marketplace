# Agarly AI

Agarly converts a short Arabic property request into a validated filter object.
The model never receives database credentials and never writes or queries SQL.
Only the sanitized search sentence is sent to the configured provider; account
IDs, email addresses, and raw prompts are not sent or persisted.

## Server environment

```text
AI_PROVIDER=kilo
KILO_API_KEY=server-only-secret
KILO_MODEL=kilo-auto/free
AI_TIMEOUT_MS=12000
```

To switch providers without changing UI or search code:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=server-only-secret
OPENAI_MODEL=gpt-5-mini
```

Never expose either API key through a `NEXT_PUBLIC_` variable. Kilo's free
router may use providers that log prompts, so Agarly redacts obvious email and
phone values and sends no profile data.

## Data and quota

- Apply `20261021000000_agarly_ai` only after review and before enabling the UI.
- The migration adds a server-only quota ledger with RLS enabled and no Data API policies.
- Each accepted AI extraction consumes one of 10 requests in a rolling 3-hour window.
- A PostgreSQL advisory transaction lock serializes reservations per user.
- `requestId` is unique, so retries cannot consume twice or invoke the model twice.
- Removing an extracted chip uses `/api/agarly/results`; it never calls the model and does not consume quota.
- Search uses published, non-paused, non-expired listings, approved projects, and approved agencies only.
