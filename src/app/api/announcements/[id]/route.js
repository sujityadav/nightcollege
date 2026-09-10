import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Announcement from "../../../models/announcement";

export async function GET(req, { params }) {
  const { id } = await params;
  await connectDB();
  const data = await Announcement.findById(id);
  return data ? NextResponse.json({ success: true, data }) : NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const payload = await req.json();
    if (payload.sortNo !== undefined) {
      payload.sortNo = Number(payload.sortNo);
    }
    const data = await Announcement.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    return data ? NextResponse.json({ success: true, data }) : NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  await connectDB();
  const data = await Announcement.findByIdAndDelete(id);
  return data ? NextResponse.json({ success: true }) : NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}
