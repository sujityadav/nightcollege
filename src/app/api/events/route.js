import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  Events  from "../../models/events";
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
    const created = await Events.create({
      Eventdata: body,
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
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = {};
    if (search) {
      query = {
        $or: [
          { "Eventdata.data.title": { $regex: search, $options: "i" } },
          { "Eventdata.data.smallDescription": { $regex: search, $options: "i" } },
          { "Eventdata.data.category": { $regex: search, $options: "i" } },
          { "Eventdata.data.location": { $regex: search, $options: "i" } },
        ],
      };
    }
      const totalRecords = await Events.countDocuments(query);
    const entries = await Events.find(query)
      .sort({ createdAt: -1 })
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