import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import NaacAqarDocument from '../../models/naacAqarDocument';

const documentListSort = { sortOrder: 1, createdAt: -1 };

function parseSortOrder(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const sortField = searchParams.get('sortField');
    const sortOrder = searchParams.get('sortOrder');
    const sortDir = Number(sortOrder) === -1 ? -1 : 1;

    const allowedSortFields = ['title', 'sortOrder'];
    const sortKey = allowedSortFields.includes(sortField) ? sortField : null;

    const query = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const total = await NaacAqarDocument.countDocuments(query);
    const sort = sortKey ? { [sortKey]: sortDir } : documentListSort;
    const data = await NaacAqarDocument.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data, total });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const title = String(body.title || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const sortOrder = parseSortOrder(body.sortOrder);
    if (sortOrder === null) {
      return NextResponse.json(
        { success: false, message: 'Valid sort order is required (0 or greater)' },
        { status: 400 }
      );
    }

    const entry = await NaacAqarDocument.create({
      title,
      description: body.description || '',
      status: body.status ?? true,
      sortOrder,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
