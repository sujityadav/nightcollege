import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Announcement from '../../../models/announcement';

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

export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    const entries = await Announcement.find({ status: true })
      .sort({ sortNo: 1, createdAt: 1 })
      .lean();

    const data = entries
      .filter((item) => isWithinDateRange(item.fromDate, item.toDate, now))
      .map((item) => ({
        title: item.title || '',
        sortNo: item.sortNo,
      }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
