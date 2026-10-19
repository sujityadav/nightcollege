import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Announcement from '../../../../models/announcement';

function isWithinDateRange(fromDate, toDate, now = new Date()) {
  if (!fromDate || !toDate) return false;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return false;

  const fromStart = new Date(from);
  fromStart.setHours(0, 0, 0, 0);
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);

  return now >= fromStart && now <= toEnd;
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const entry = await Announcement.findById(id).lean();
    if (!entry || !entry.status) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (!isWithinDateRange(entry.fromDate, entry.toDate)) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: String(entry._id),
        title: entry.title || '',
        description: entry.description || '',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
