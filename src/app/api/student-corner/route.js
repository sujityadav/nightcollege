import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import StudentCorner from '../../models/studentCorner';
import MasterYear from '../../models/masterYear';

const validatePayload = async (data, isUpdate = false) => {
  if (!isUpdate) {
    if (!data.title?.trim()) return 'Title is required';
    if (!data.description?.trim()) return 'Description is required';
    if (!data.masterYearId) return 'Year is required';
    if (!data.fileUrl?.trim()) return 'File is required';
    if (data.sortOrder === undefined || data.sortOrder === '') return 'Sort order is required';
  }

  if (data.sortOrder !== undefined && data.sortOrder !== '' && Number.isNaN(Number(data.sortOrder))) {
    return 'Sort order must be a number';
  }

  if (data.masterYearId) {
    const year = await MasterYear.findById(data.masterYearId);
    if (!year) return 'Selected year is invalid';
  }

  return null;
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { fileName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await StudentCorner.countDocuments(query);
    const data = await StudentCorner.find(query)
      .populate('masterYearId')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data, total });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const validationError = await validatePayload(data, false);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const entry = await StudentCorner.create({
      title: data.title.trim(),
      description: data.description,
      masterYearId: data.masterYearId,
      fileUrl: data.fileUrl.trim(),
      fileName: data.fileName?.trim() || '',
      sortOrder: Number(data.sortOrder),
      status: data.status ?? true,
    });

    const populated = await StudentCorner.findById(entry._id).populate('masterYearId');
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
