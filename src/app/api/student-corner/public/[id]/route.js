import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import StudentCorner from '../../../../models/studentCorner';
import { normalizeStudentCornerAttachments } from '../../../../lib/studentCornerData';

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await StudentCorner.findOne({ _id: id, status: { $ne: false } })
      .populate('masterYearId')
      .lean();

    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const year = item.masterYearId;
    const yearLabel =
      year && typeof year === 'object' && year.fromYear != null
        ? `${year.fromYear} – ${year.toYear}`
        : '';

    return NextResponse.json({
      success: true,
      data: {
        id: String(item._id),
        title: item.title?.trim() || '',
        description: item.description || '',
        yearLabel,
        files: normalizeStudentCornerAttachments(item),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
