import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  Commities  from "../../models/commities";
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
    const created = await Commities.create({
      CommitiesData: body,
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
    const { search, page = 1, limit = 10, sortField = "createdAt", sortOrder = -1 } =
      Object.fromEntries(new URL(req.url).searchParams);

    let query = {};
    if (search) {
      query = {
        $or: [
          { "CommitiesData.data.title": { $regex: search, $options: "i" } },
          { "CommitiesData.data.smallDescription": { $regex: search, $options: "i" } },
        ],
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
   const totalRecords = await Commities.countDocuments(query);
     const data = await Commities.find(query)
      .sort({ [sortField]: parseInt(sortOrder) })
      .skip(skip)
      .limit(parseInt(limit));

    return NextResponse.json(
      { success: true, data, totalRecords },
      { status: 200 }
    );
  
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}