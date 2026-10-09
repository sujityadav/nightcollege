import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Rebranding from '../../../models/rebranding';

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

    const entries = await Rebranding.find({
      'RebrandingData.data.status': 1,
    })
      .sort({ 'RebrandingData.data.sortNo': 1, createdAt: 1 })
      .lean();

    const data = entries
      .map((entry) => entry?.RebrandingData?.data)
      .filter((banner) => banner?.photo && isWithinDateRange(banner.fromDate, banner.toDate, now))
      .map((banner) => ({
        title: banner.title || '',
        description: banner.description || '',
        photo: banner.photo,
        mediaType: banner.mediaType || 'Photo',
        sortNo: banner.sortNo,
      }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
