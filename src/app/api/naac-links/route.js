import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import NaacLink from '../../models/naacLink';
import { isNaacQuickLinkSection } from '../../features/naac/constants';
import { buildNaacLinkWriteData, validateNaacLinkPayload } from './naacLinkValidation';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section') || '';

    if (!isNaacQuickLinkSection(section)) {
      return NextResponse.json({ success: false, message: 'Invalid NAAC section' }, { status: 400 });
    }

    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const sortField = searchParams.get('sortField');
    const sortOrder = searchParams.get('sortOrder');
    const sortDir = Number(sortOrder) === -1 ? -1 : 1;

    const allowedSortFields = ['title', 'sortOrder', 'type', 'slug'];
    const sortKey = allowedSortFields.includes(sortField) ? sortField : null;

    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            { type: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const query = search ? { $and: [{ section }, searchFilter] } : { section };

    const total = await NaacLink.countDocuments(query);
    const sort = sortKey ? { [sortKey]: sortDir } : { sortOrder: 1, createdAt: -1 };
    const data = await NaacLink.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data, total });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const validationError = await validateNaacLinkPayload(data, false);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const entry = await NaacLink.create(buildNaacLinkWriteData(data));

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
