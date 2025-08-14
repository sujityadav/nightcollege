import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Staff from "../../../models/stafs";
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
     console.log("body", body.data);
    const updated = await Staff.findByIdAndUpdate(
  id,
  { 'StaffData.data': body.data }, // ✅ correct path
  { new: true, runValidators: true }
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Staff updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating Staff', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const updated = await Staff.findByIdAndDelete(
  id,
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Staff updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating Staff', error: error.message }, { status: 500 });
  }
}