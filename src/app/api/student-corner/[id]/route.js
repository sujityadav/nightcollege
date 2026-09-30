import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import StudentCorner from '../../../models/studentCorner';
import MasterYear from '../../../models/masterYear';

const validatePayload = async (data) => {
  if (data.title !== undefined && !String(data.title).trim()) return 'Title is required';
  if (data.description !== undefined && !String(data.description).trim()) return 'Description is required';
  if (data.fileUrl !== undefined && !String(data.fileUrl).trim()) return 'File is required';
  if (data.sortOrder !== undefined && data.sortOrder !== '' && Number.isNaN(Number(data.sortOrder))) {
    return 'Sort order must be a number';
  }
  if (data.masterYearId) {
    const year = await MasterYear.findById(data.masterYearId);
    if (!year) return 'Selected year is invalid';
  }
  return null;
};

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await StudentCorner.findById(id).populate('masterYearId');
    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const payload = await req.json();

    if (payload.status !== undefined && Object.keys(payload).length === 1) {
      const data = await StudentCorner.findByIdAndUpdate(
        id,
        { status: Boolean(payload.status) },
        { new: true, runValidators: true }
      ).populate('masterYearId');
      return data
        ? NextResponse.json({ success: true, data })
        : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const validationError = await validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const update = {};
    if (payload.title !== undefined) update.title = String(payload.title).trim();
    if (payload.description !== undefined) update.description = payload.description;
    if (payload.masterYearId !== undefined) update.masterYearId = payload.masterYearId;
    if (payload.fileUrl !== undefined) update.fileUrl = String(payload.fileUrl).trim();
    if (payload.fileName !== undefined) update.fileName = String(payload.fileName).trim();
    if (payload.sortOrder !== undefined) update.sortOrder = Number(payload.sortOrder);
    if (payload.status !== undefined) update.status = Boolean(payload.status);

    const data = await StudentCorner.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate('masterYearId');

    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await StudentCorner.findByIdAndDelete(id);
    return data
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
