import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  Staff  from "../../models/stafs";
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();


    if (!body?.data) {
      return NextResponse.json(
        { success: false, message: "Missing 'data' in body" },
        { status: 400 }
      );
    }
    const created = await Staff.create({
      StaffData: body,
    });
    return NextResponse.json(
      { success: true, message: "Data stored", entry: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error storing data", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // Extract query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = parseInt(searchParams.get("sortOrder")) || -1;
    const search = searchParams.get("search") || "";

    // Build filter (for search)
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { "StaffData.data.name": { $regex: search, $options: "i" } },
          { "StaffData.data.designation": { $regex: search, $options: "i" } }
        ]
      };
    }

    // Count total records for pagination
    const totalRecords = await Staff.countDocuments(filter);

    // Fetch data with pagination + sorting
    const entries = await Staff.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      { success: true, data: entries, totalRecords },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}