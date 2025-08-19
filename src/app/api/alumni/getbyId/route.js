import { NextResponse } from "next/server";
import  Alumni  from "../../../models/alumni";
import { connectDB } from "../../../lib/mongodb";
export async function GET(req) {
  try {
    await connectDB();
     const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const entries = await Alumni.find({_id:id}).sort({ createdAt: -1 }); // latest first

    return NextResponse.json(
      { success: true, data: entries },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}