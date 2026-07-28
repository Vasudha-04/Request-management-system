import { z } from "zod";

// ─── Domain Types ───

export type Role = "CREATOR" | "REVIEWER";

export type Status =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface AppRequest {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdBy: string;
}

// ─── Zod Schemas (Server-side validation) ───

export const CreateRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  userId: z.string(),
});

export const UpdateStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED"]),
  role: z.enum(["CREATOR", "REVIEWER"]),
});

// ─── Workflow Enforcement ───

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransition(
  current: Status,
  next: Status,
  role: Role
): boolean {
  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed?.includes(next)) return false;

  // Role enforcement
  if ((next === "APPROVED" || next === "REJECTED") && role !== "REVIEWER")
    return false;
  if (
    (next === "SUBMITTED" || next === "CANCELLED") &&
    role !== "CREATOR"
  )
    return false;

  return true;
}

// ─── In-Memory Store ───

export const requests: AppRequest[] = [];

