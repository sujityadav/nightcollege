import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import DepartmentlActivity from "../../models/departmentalactivity";

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

    const created = await DepartmentlActivity.create({
      DepartmentlActivityData: {
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
    const subDepartmentId = searchParams.get("subDepartmentId");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    if (!subDepartmentId) {
      return NextResponse.json(
        { success: false, message: "subDepartmentId is required" },
        { status: 400 }
      );
    }

    let query = {
      "DepartmentlActivityData.data.subDepartmentId": subDepartmentId,
    };

    if (search) {
      query = {
        $and: [
          { "DepartmentlActivityData.data.subDepartmentId": subDepartmentId },
          {
            $or: [
              { "DepartmentlActivityData.data.title": { $regex: search, $options: "i" } },
              { "DepartmentlActivityData.data.smallDescription": { $regex: search, $options: "i" } },
              { "DepartmentlActivityData.data.category": { $regex: search, $options: "i" } },
              { "DepartmentlActivityData.data.category": search },
              { "DepartmentlActivityData.data.location": { $regex: search, $options: "i" } },
            ],
          },
        ],
      };
    }

    const totalRecords = await DepartmentlActivity.countDocuments(query);
    const entries = await DepartmentlActivity.find(query)
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
