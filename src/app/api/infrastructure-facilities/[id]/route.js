import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import InfrastructureFacilities from '../../../models/infrastructureFacilities';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await InfrastructureFacilities.findByIdAndUpdate(
      id,
      { 'InfrastructureFacilitiesData.data': body.data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Record updated', data: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error updating record', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await InfrastructureFacilities.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Record deleted', data: deleted }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error deleting record', error: error.message },
      { status: 500 }
    );
  }
}
