import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ApiErrorResponse } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const members = await db.getMembers();
    return NextResponse.json(
      { members },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch members";
    return NextResponse.json<ApiErrorResponse>(
      { error: message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await db.createMember(body);
    db.clearCache();
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/members");
    } catch {
      // Ignore outside request context
    }
    return NextResponse.json({ member: created });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create member";
    return NextResponse.json<ApiErrorResponse>(
      { error: message },
      { status: 500 },
    );
  }
}
