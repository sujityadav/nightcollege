import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  Departments  from "../../models/departmenst";
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
    const created = await Departments.create({
      DepartmentsData: body,
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

    // Get query params from request URL
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;
    const search = searchParams.get("search") || "";

    // Build filter for search (example: searching by "name")
    let filter = {};
    if (search) {
      filter = {
        name: { $regex: search, $options: "i" }, // case-insensitive search
      };
    }

    // Count total documents
    const total = await Departments.countDocuments(filter);

    // Fetch paginated + sorted + searched data
    const entries = await Departments.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        status: "SUCCESS",
        result: {
          data: entries,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          sort: {
            sortBy,
            order: order === 1 ? "asc" : "desc",
          },
          search: search || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "FAILURE",
        result: {
          message: "Failed to fetch data",
          error: error.message,
        },
      },
      { status: 500 }
    );
  }
}