import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import FileManagerYear from "@/app/models/fileManagerYear";

export async function GET() {
  try {
    await connectDB();
    const years = await FileManagerYear.find().sort({
      isCurrent: -1,
      name: -1,
    });
    return NextResponse.json({ success: true, data: years });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { name, isCurrent = false } = await req.json();
    if (!name?.trim())
      return NextResponse.json(
        { success: false, message: "Year name is required" },
        { status: 400 },
      );
    if (isCurrent)
      await FileManagerYear.updateMany({}, { $set: { isCurrent: false } });
    const year = await FileManagerYear.create({ name: name.trim(), isCurrent });
    return NextResponse.json({ success: true, data: year }, { status: 201 });
  } catch (error) {
    const message =
      error?.code === 11000 ? "This year already exists" : error.message;
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
