import { NextResponse, NextRequest } from "next/server";
import {
  requests,
  CreateRequestSchema,
  UpdateStatusSchema,
  canTransition,
  AppRequest,
} from "@/lib/types";

export async function GET() {
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, userId } = CreateRequestSchema.parse(body);

    const newRequest: AppRequest = {
      id: Date.now().toString(),
      title,
      description,
      status: "DRAFT",
      createdBy: userId,
    };

    requests.push(newRequest);
    return NextResponse.json(newRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
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

    if (!canTransition(request.status, status, role)) {
      return NextResponse.json(
        { error: "Unauthorized or invalid transition" },
        { status: 400 }
      );
    }

    requests[requestIndex].status = status;
    return NextResponse.json(requests[requestIndex]);
  } catch {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
}

