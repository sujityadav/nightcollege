import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import DepartmentlActivity from "../../../models/departmentalactivity";
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await DepartmentlActivity.findByIdAndUpdate(
      id,
      { 'DepartmentlActivityData.data': body.data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Departmental activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Departmental activity updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating departmental activity', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const updated = await DepartmentlActivity.findByIdAndDelete(
  id,
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'DepartmentlActivity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'DepartmentlActivity updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating DepartmentlActivity', error: error.message }, { status: 500 });
  }
}