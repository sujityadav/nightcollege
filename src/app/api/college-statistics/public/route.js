import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import CollegeStatistic from '../../../models/collegeStatistic';

export async function GET() {
  try {
    await connectDB();
    const data = await CollegeStatistic.find({ status: true })
      .sort({ sortOrder: 1 })
      .select('title count sortOrder')
      .lean();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
