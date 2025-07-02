import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  AboutUs  from "../../models/aboutus";

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized: Missing token" }, { status: 401 });
    }

    const { data } = await req.json();

    if (!data) {
      return NextResponse.json({ success: false, message: "Missing 'data' field" }, { status: 400 });
    }

    const created = await AboutUs.create({ Aboutusdata:data });

    return NextResponse.json(
      { success: true, message: "Data stored", entry: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to store data", error: error.message },
      { status: 500 }
    );
  }
}
