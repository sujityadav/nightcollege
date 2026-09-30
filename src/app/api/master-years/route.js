import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import MasterYear from '../../models/masterYear';

const parseYear = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1900 || num > 2100) return null;
  return num;
};

const validateYears = (fromYear, toYear) => {
  if (fromYear === null || toYear === null) {
    return 'From year and to year are required';
  }
  if (fromYear > toYear) {
    return 'From year cannot be greater than to year';
  }
  return null;
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const sortField = searchParams.get('sortField') || 'fromYear';
    const sortOrder = searchParams.get('sortOrder');
    const sortDir = Number(sortOrder) === -1 ? -1 : 1;

    const allowedSortFields = ['fromYear', 'toYear', 'status', 'createdAt'];
    const sortKey = allowedSortFields.includes(sortField) ? sortField : 'fromYear';

    let query = {};
    if (search) {
      const yearNum = Number(search);
      if (!Number.isNaN(yearNum)) {
        query = { $or: [{ fromYear: yearNum }, { toYear: yearNum }] };
      }
    }

    const total = await MasterYear.countDocuments(query);
    const data = await MasterYear.find(query)
      .sort({ [sortKey]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data, total });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const fromYear = parseYear(body.fromYear);
    const toYear = parseYear(body.toYear);
    const validationError = validateYears(fromYear, toYear);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const entry = await MasterYear.create({
      fromYear,
      toYear,
      status: body.status ?? true,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'This year range already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
