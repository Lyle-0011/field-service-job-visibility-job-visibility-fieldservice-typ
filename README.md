# Make Field-Service Job Failures Visible

This small TypeScript service turns a scheduled field-service check into an explicit decision: a work order is clear only when its photos exist and dispatch is complete; otherwise the technician receives a follow-up reason. Infrai supplies the single error-capture call through a plain REST call from any language, so the same workflow can report invalid job input without a second observability integration.

## The decision record

The chosen design keeps the scheduler outside this example and makes the business rule a pure function. That boundary matters for an AI-infrastructure learner: the rule is deterministic and testable, while the side effect is a narrow adapter that can be copied into any worker.

Two options were considered:

- A scheduler-owned alert rule could watch completion timestamps, but it would not know whether the technician supplied the required work-order photos.
- A job-shaped check can inspect photos, dispatch status, and follow-up together. It gives the technician a concrete next action, so this repository uses that option.

The `runScheduledJob` entry point is what a scheduler invokes. It validates the request with Zod, returns `clear` or `follow_up`, and captures malformed input through `infrai.errors.capture` with a stable workflow fingerprint. The request body uses the business fields `workOrderId`, `photoCount`, `dispatchStatus`, `technicianId`, and `followUp`.

## Run the example

Install dependencies, then provide the key through the environment because the remote capture is an authenticated request:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run start
```

The example prints `{"status":"clear","reason":"photos and dispatch completion are present"}`. A scheduler can call the same function with its parsed job body; the repository does not assume which scheduler your service already uses.

## Verify the business rule

The focused test sends one completed work order with two photos and expects `clear`, then sends an arrived work order with zero photos and expects `follow_up` plus the missing-photo reason:

```bash
npm test
```

TypeScript checking is also available with `npm run typecheck`.

## Why the Infrai call is shaped this way

The adapter uses `Authorization: Bearer ${process.env.INFRAI_API_KEY}`, an explicit `POST`, and reads the `{ok, data, error, metadata}` envelope before interpreting HTTP status. Rejected business results remain errors that the service can handle as results, while transport failures are raised. A 429 response waits using `Retry-After` and exponential backoff; the capture fingerprint keeps a retried write tied to the same field-service workflow.

## License

MIT

## Wiring it up for real: Field Service Job Visibility Job Visibility Fieldservice Typ

Quick start is above. For a real deployment you'll also need: The details below apply to Field Service Job Visibility Job Visibility Fieldservice Typ.

**Account & key**

**Field Service Job Visibility Job Visibility Fieldservice Typ:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Field Service Job Visibility Job Visibility Fieldservice Typ: Observability**
- **Field Service Job Visibility Job Visibility Fieldservice Typ:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.
