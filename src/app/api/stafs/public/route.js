import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Staff from '../../../models/stafs';

const ALLOWED_STAFF_TYPES = new Set(['Teaching', 'Non Teaching']);

function mapStaffRow(entry) {
  const data = entry?.StaffData?.data || {};
  return {
    id: String(entry._id),
    name: data.name?.trim() || '',
    designation: data.designation?.trim() || '',
    photo: data.photo?.trim() || '',
    bio: data.details?.trim() || '',
    resume: data.resume?.trim() || '',
    resumeFileName: data.resumeFileName?.trim() || 'Resume',
    staffType: data.staffType?.trim() || '',
  };
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const staffType = searchParams.get('staffType')?.trim() || '';

    const filter = {};
    if (staffType) {
      if (!ALLOWED_STAFF_TYPES.has(staffType)) {
        return NextResponse.json(
          { success: false, message: 'Invalid staff type' },
          { status: 400 }
        );
      }
      filter['StaffData.data.staffType'] = staffType;
    }

    const entries = await Staff.find(filter).sort({ createdAt: -1 }).limit(500).lean();

    const data = entries
      .map(mapStaffRow)
      .filter((item) => item.name || item.designation || item.bio || item.photo);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
