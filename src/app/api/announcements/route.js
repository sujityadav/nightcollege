import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Announcement from "../../models/announcement";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const query = search ? { $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ] } : {};
    const total = await Announcement.countDocuments(query);
    const data = await Announcement.find(query).sort({ sortNo: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return NextResponse.json({ success: true, data, total });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    if (data.sortNo === undefined || !data.title || !data.description || !data.fromDate || !data.toDate) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }
    if (new Date(data.toDate) < new Date(data.fromDate)) {
      return NextResponse.json({ success: false, message: "To date must be after from date" }, { status: 400 });
    }
    const entry = await Announcement.create({
      ...data,
      sortNo: Number(data.sortNo),
    });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
