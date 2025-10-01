import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  Alumni  from "../../models/alumni";
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
    const created = await Alumni.create({
      AlumniData: body,
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = parseInt(searchParams.get("sortOrder")) || -1;
    const search = searchParams.get("search") || "";

    // search filter
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { "AlumniData.data.fullName": { $regex: search, $options: "i" } },
          { "AlumniData.data.course": { $regex: search, $options: "i" } },
          { "AlumniData.data.company": { $regex: search, $options: "i" } },
        ]
      };
    }

    const totalRecords = await Alumni.countDocuments(filter);

    const entries = await Alumni.find(filter)
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