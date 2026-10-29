import { z } from "zod";
import { infrai } from "./infrai.js";

export const WorkOrder = z.object({
  workOrderId: z.string().min(1),
  photoCount: z.number().int().nonnegative(),
  dispatchStatus: z.enum(["assigned", "en_route", "arrived", "complete"]),
  technicianId: z.string().min(1),
  followUp: z.string().min(1)
});

export type WorkOrder = z.infer<typeof WorkOrder>;

export function decideFollowUp(input: unknown): { status: "follow_up" | "clear"; reason: string } {
  const job = WorkOrder.parse(input);
  if (job.photoCount === 0) return { status: "follow_up", reason: "work-order photo is missing" };
  if (job.dispatchStatus !== "complete") return { status: "follow_up", reason: `dispatch is ${job.dispatchStatus}` };
  return { status: "clear", reason: "photos and dispatch completion are present" };
}

export async function runScheduledJob(input: unknown): Promise<ReturnType<typeof decideFollowUp>> {
  try {
    return decideFollowUp(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid work order";
    await infrai.errors.capture({
      message,
      level: "error",
      fingerprint: ["field-service", "work-order-follow-up"],
      context: { workflow: "scheduled field-service job", input }
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await runScheduledJob({
    workOrderId: "wo-1042",
    photoCount: 2,
    dispatchStatus: "complete",
    technicianId: "tech-7",
    followUp: "confirm customer handoff"
  });
  console.log(JSON.stringify(result));
}
