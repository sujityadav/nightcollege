import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import CollegeStatistic from '../../models/collegeStatistic';

export async function POST(req) {
  try {
    await connectDB();
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

    const statistic = await CollegeStatistic.create({
      title: title.trim(),
      count: String(count).trim(),
      sortOrder: order,
      status: status !== false,
    });

    return NextResponse.json({ success: true, data: statistic }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to create statistic' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const limit = Math.max(Number(searchParams.get('limit')) || 10, 1);
    const requestedSort = searchParams.get('sortField');
    const sortField = ['title', 'count', 'sortOrder', 'status', 'createdAt'].includes(requestedSort)
      ? requestedSort
      : 'sortOrder';
    const sortOrder = Number(searchParams.get('sortOrder')) === -1 ? -1 : 1;
    const search = searchParams.get('search')?.trim() || '';

    const filter = search ? { title: { $regex: search, $options: 'i' } } : {};

    const [data, totalRecords] = await Promise.all([
      CollegeStatistic.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
      CollegeStatistic.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data, totalRecords });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch statistics' },
      { status: 500 }
    );
  }
}
