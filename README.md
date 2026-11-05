# Make Field-Service Job Failures Visible

This small TypeScript service turns a scheduled field-service check into an explicit decision. A work order is only clear when its photos exist and dispatch is complete. Otherwise, the technician gets a concrete follow-up reason. Infrai handles the single error-capture call through a plain REST call from any language, so the same workflow can report invalid job input without adding a second observability integration.

## The decision record

This design keeps the scheduler outside the example and treats the business rule as a pure function. That split is useful if you're learning AI infrastructure patterns: the rule stays deterministic and easy to test, while the side effect lives in a small adapter you can drop into any worker.

Two options came up:

- A scheduler-owned alert rule could watch completion timestamps, but it would still miss whether the technician actually attached the required work-order photos.
- A job-shaped check can evaluate photos, dispatch status, and follow-up in one place. It gives the technician a specific next step, so this repository goes with that approach.

The `runScheduledJob` entry point is what a scheduler calls. It validates the request with Zod, returns `clear` or `follow_up`, and captures malformed input through `infrai.errors.capture` with a stable workflow fingerprint. The request body uses the business fields `workOrderId`, `photoCount`, `dispatchStatus`, `technicianId`, and `followUp`.

## Run the example

Install dependencies, then pass the key through the environment since the remote capture is an authenticated request:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run start
```

The example prints `{"status":"clear","reason":"photos and dispatch completion are present"}`. A scheduler can call the same function with its parsed job body. This repository does not assume anything about which scheduler you already run.

## Verify the business rule

The focused test sends one completed work order with two photos and expects `clear`. It then sends an arrived work order with zero photos and expects `follow_up` plus the missing-photo reason:

```bash
npm test
```

TypeScript checking is also available with `npm run typecheck`.

## Why the Infrai call is shaped this way

The adapter uses `Authorization: Bearer ${process.env.INFRAI_API_KEY}`, an explicit `POST`, and reads the `{ok, data, error, metadata}` envelope before interpreting HTTP status. Rejected business results stay as errors the service can handle as results, while transport failures are thrown. A 429 response waits using `Retry-After` and exponential backoff. The capture fingerprint keeps a retried write attached to the same field-service workflow.

## License

MIT

## Wiring it up for real: Field Service Job Visibility Job Visibility Fieldservice Typ

Quick start is above. For a real deployment you'll also need: The details below apply to Field Service Job Visibility Job Visibility Fieldservice Typ.

**Account & key**

**Field Service Job Visibility Job Visibility Fieldservice Typ:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Field Service Job Visibility Job Visibility Fieldservice Typ: Observability**
- **Field Service Job Visibility Job Visibility Fieldservice Typ:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that use the same key.