import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Commities from "../../../models/commities";
import { validateCommitteeFormData } from "../../../lib/committeeData";
import { findCommitteeDuplicateYear } from "../../../lib/committeeYearDuplicate";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const validationError = validateCommitteeFormData(body?.data);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const duplicate = await findCommitteeDuplicateYear(body.data.masterYearId, id);
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'A committee already exists for the selected year. Choose a different year.',
        },
        { status: 409 }
      );
    }

    const updated = await Commities.findByIdAndUpdate(
      id,
      { 'CommitiesData.data': body.data },
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
    const { id } = await params;
    const updated = await Commities.findByIdAndDelete(
  id,
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Commities not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Commities updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating Commities', error: error.message }, { status: 500 });
  }
}