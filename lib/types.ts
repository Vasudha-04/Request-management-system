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
