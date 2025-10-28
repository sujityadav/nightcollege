import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  Rebranding  from "../../models/rebranding";
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
    const created = await Rebranding.create({
      RebrandingData: body,
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

    // extract search param
     const { search, page = 1, limit = 10 } = Object.fromEntries(new URL(req.url).searchParams);

    let query = {};
    if (search) {
      query = {
        $or: [
          { "Newsdata.data.title": { $regex: search, $options: "i" } },
          { "Newsdata.data.smallDescription": { $regex: search, $options: "i" } },
          { "Newsdata.data.category": { $regex: search, $options: "i" } },
          { "Newsdata.data.location": { $regex: search, $options: "i" } },
        ],
      };
    }

     const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Rebranding.countDocuments(query);
    const entries = await Rebranding.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return NextResponse.json(
      { success: true, data: entries, total },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}