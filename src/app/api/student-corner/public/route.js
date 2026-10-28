import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import StudentCorner from '../../../models/studentCorner';

export async function GET() {
  try {
    await connectDB();
    const data = await StudentCorner.find({ status: { $ne: false } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title sortOrder')
      .limit(500)
      .lean();

    return NextResponse.json({
      success: true,
      data: data.map((item) => ({
        id: String(item._id),
        title: item.title?.trim() || '',
        sortOrder: item.sortOrder ?? 0,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
