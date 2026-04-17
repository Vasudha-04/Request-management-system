import { NextResponse, NextRequest } from "next/server";
import { requests } from "@/lib/store"; // Adjust path as needed
import { AppRequest, Status, Role } from "@/lib/types";
import { z } from "zod";

// Zod schema for input validation (Requirement #9)
const CreateRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  userId: z.string(),
});

const UpdateStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED"]),
  role: z.enum(["CREATOR", "REVIEWER"]),
});

export async function GET() {
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateRequestSchema.parse(body);

    const newRequest: AppRequest = {
      id: Date.now().toString(),
      title: validatedData.title,
      description: validatedData.description,
      status: "DRAFT",
      createdBy: validatedData.userId,
    };

    requests.push(newRequest);

    return NextResponse.json(newRequest, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: "Invalid input data" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, role } = UpdateStatusSchema.parse(body);

    const requestIndex = requests.findIndex((r) => r.id === id);
    if (requestIndex === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const request = requests[requestIndex];

    // Centralized Logic Check (You could move this to a helper function)
    if (!canTransition(request.status, status, role)) {
      return NextResponse.json({ error: "Unauthorized or invalid transition" }, { status: 400 });
    }

    requests[requestIndex].status = status;
    return NextResponse.json(requests[requestIndex]);
  } catch (error) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
}

// Helper for Workflow Enforcement
function canTransition(current: Status, next: Status, role: Role): boolean {
  const allowed: Record<Status, Status[]> = {
    DRAFT: ["SUBMITTED", "CANCELLED"],
    SUBMITTED: ["APPROVED", "REJECTED", "CANCELLED"],
    APPROVED: [],
    REJECTED: [],
    CANCELLED: [],
  };

  if (!allowed[current].includes(next)) return false;
  
  // Role Enforcement
  if ((next === "APPROVED" || next === "REJECTED") && role !== "REVIEWER") return false;
  if ((next === "SUBMITTED" || next === "CANCELLED") && role !== "CREATOR") return false;

  return true;
}
