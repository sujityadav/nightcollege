import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import InnerDepartments from "../../../models/innerdepartments";
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
     console.log("body", body.data);
    const updated = await InnerDepartments.findByIdAndUpdate(
  id,
  { 'InnerDepartmentsData.data': body.data }, // ✅ correct path
  { new: true, runValidators: true }
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Event updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating event', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const updated = await InnerDepartments.findByIdAndDelete(
  id,
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'InnerDepartments not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'InnerDepartments updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating InnerDepartments', error: error.message }, { status: 500 });
  }
}