import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const members = await db.getMembers();
    return NextResponse.json({ members });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await db.createMember(body);
    return NextResponse.json({ member: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
