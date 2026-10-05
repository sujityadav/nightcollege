import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  Events  from "../../models/events";
import { getFromDateYearFilter, mergeQueriesWithAnd } from "../../lib/listYearFilterOptions";
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
      Eventdata: {
        data: {
          ...body.data,
          status: body.data.status ?? 1,
        },
      },
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
    const year = searchParams.get("year") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortField = searchParams.get("sortField");
    const sortOrder = searchParams.get("sortOrder");
    const sortDir = Number(sortOrder) === -1 ? -1 : 1;

    const allowedSortFields = [
      "Eventdata.data.title",
      "Eventdata.data.smallDescription",
      "Eventdata.data.location",
      "Eventdata.data.fromDate",
      "Eventdata.data.toDate",
      "createdAt",
    ];
    const sortKey = allowedSortFields.includes(sortField) ? sortField : "createdAt";

    let query = {};
    if (search) {
      query = {
        $or: [
          { "Eventdata.data.title": { $regex: search, $options: "i" } },
          { "Eventdata.data.smallDescription": { $regex: search, $options: "i" } },
          { "Eventdata.data.category": { $regex: search, $options: "i" } },
          { "Eventdata.data.category": search },
          { "Eventdata.data.location": { $regex: search, $options: "i" } },
        ],
      };
    }

    const yearFilter = getFromDateYearFilter("Eventdata.data.fromDate", year);
    if (yearFilter) {
      query = mergeQueriesWithAnd(query, yearFilter);
    }
      const totalRecords = await Events.countDocuments(query);
    const entries = await Events.find(query)
      .sort({ [sortKey]: sortDir })
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