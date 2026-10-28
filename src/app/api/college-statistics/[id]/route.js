import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import CollegeStatistic from '../../../models/collegeStatistic';

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const statistic = await CollegeStatistic.findById(id);
    if (!statistic) {
      return NextResponse.json({ success: false, message: 'Statistic not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: statistic });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch statistic' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { title, count, sortOrder, status } = await req.json();

    if (!title?.trim() || count === undefined || count === null || String(count).trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Title and count are required' },
        { status: 400 }
      );
    }

    const order = Number(sortOrder);
    if (!Number.isFinite(order) || order < 0) {
      return NextResponse.json(
        { success: false, message: 'A valid sort order is required' },
        { status: 400 }
      );
    }

    const statistic = await CollegeStatistic.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        count: String(count).trim(),
        sortOrder: order,
        status: status !== false,
      },
      { new: true, runValidators: true }
    );

    if (!statistic) {
      return NextResponse.json({ success: false, message: 'Statistic not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: statistic });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to update statistic' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const statistic = await CollegeStatistic.findByIdAndDelete(id);
    if (!statistic) {
      return NextResponse.json({ success: false, message: 'Statistic not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Statistic deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to delete statistic' },
      { status: 500 }
    );
  }
}
