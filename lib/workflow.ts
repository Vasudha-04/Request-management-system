import { Status, Role } from "./types";

export function canTransition(
  current: Status,
  next: Status,
  role: Role
): boolean {
  if (current === "DRAFT" && next === "SUBMITTED" && role === "CREATOR")
    return true;

  if (current === "SUBMITTED" && ["APPROVED", "REJECTED"].includes(next) && role === "REVIEWER")
    return true;

  if (current !== "APPROVED" && next === "CANCELLED" && role === "CREATOR")
    return true;

  return false;
}