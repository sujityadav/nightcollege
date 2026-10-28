import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import CollegePublication from '../../../../models/collegePublication';
import MasterYear from '../../../../models/masterYear';
import { normalizePublicationAttachments } from '../../../../lib/collegePublicationData';

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const entry = await CollegePublication.findById(id).lean();

    if (!entry?.PublicationData?.data) {
      return NextResponse.json({ success: false, message: 'Publication not found' }, { status: 404 });
    }

    const item = entry.PublicationData.data;
    let yearLabel = '';
    if (item.masterYearId) {
      const year = await MasterYear.findById(item.masterYearId).lean();
      if (year) {
        yearLabel = `${year.fromYear} – ${year.toYear}`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(entry._id),
        title: item.title?.trim() || '',
        description: item.description?.trim() || '',
        sortOrder: Number(item.sortOrder) || 0,
        masterYearId: item.masterYearId ? String(item.masterYearId) : '',
        yearLabel,
        files: normalizePublicationAttachments(item),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch publication' },
      { status: 500 }
    );
  }
}
