import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import CollegePublication from '../../../models/collegePublication';
import MasterYear from '../../../models/masterYear';

export async function GET() {
  try {
    await connectDB();

    const entries = await CollegePublication.find({})
      .sort({ 'PublicationData.data.sortOrder': 1, createdAt: -1 })
      .limit(500)
      .lean();

    const yearIds = entries
      .map((entry) => entry?.PublicationData?.data?.masterYearId)
      .filter(Boolean);

    const years = await MasterYear.find({ _id: { $in: yearIds } }).lean();
    const yearMap = new Map(
      years.map((year) => [String(year._id), `${year.fromYear} – ${year.toYear}`])
    );

    const data = entries.map((entry) => {
      const item = entry.PublicationData?.data || {};
      const masterYearId = item.masterYearId ? String(item.masterYearId) : '';
      return {
        id: String(entry._id),
        title: item.title?.trim() || '',
        sortOrder: Number(item.sortOrder) || 0,
        masterYearId,
        yearLabel: yearMap.get(masterYearId) || '',
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch publications' },
      { status: 500 }
    );
  }
}
