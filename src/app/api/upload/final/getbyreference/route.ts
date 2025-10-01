// app/api/upload/final/route.ts
import { NextRequest, NextResponse } from "next/server";
import Uploads from "@/app/models/upload";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceId } = body;
    const imageData = await Uploads.findOne({ referenceId }).sort({ createdAt: -1 });
    return NextResponse.json({
      message: "File Getting successfully",
      imageData,
    });
  } catch (err: any) {
    console.error("Final save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
