import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import SubAdministration from "../../../models/subadministration";
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
     console.log("body", body.data);
    const updated = await SubAdministration.findByIdAndUpdate(
  id,
  { 'SubAdministrationData.data': body.data }, // ✅ correct path
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
    const updated = await SubAdministration.findByIdAndDelete(
  id,
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'SubAdministration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'SubAdministration updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating SubAdministration', error: error.message }, { status: 500 });
  }
}