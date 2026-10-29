import test from "node:test";
import assert from "node:assert/strict";
import { decideFollowUp } from "../src/field_service_job.js";

test("a completed work order with photos needs no technician follow-up", () => {
  const result = decideFollowUp({
    workOrderId: "wo-1042",
    photoCount: 2,
    dispatchStatus: "complete",
    technicianId: "tech-7",
    followUp: "confirm customer handoff"
  });
  assert.deepEqual(result, { status: "clear", reason: "photos and dispatch completion are present" });
});

test("a dispatched work order without photos creates follow-up", () => {
  const result = decideFollowUp({
    workOrderId: "wo-1043",
    photoCount: 0,
    dispatchStatus: "arrived",
    technicianId: "tech-8",
    followUp: "upload arrival photos"
  });
  assert.deepEqual(result, { status: "follow_up", reason: "work-order photo is missing" });
});
