import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import  DepartmentlActivity  from "../../models/departmentalactivity";
import { Types } from "mongoose";
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
      DepartmentlActivityData: body,
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
    const departmentId = searchParams.get("departmentId");
    console.log("departmentId", departmentId)
    const entries = await DepartmentlActivity.find({
  "DepartmentlActivityData.data.depatmentId": departmentId
}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: entries },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}