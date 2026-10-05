import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import InfrastructureFacilities from '../../models/infrastructureFacilities';
import { getFromDateYearFilter, mergeQueriesWithAnd } from '../../lib/listYearFilterOptions';

const DATA_PREFIX = 'InfrastructureFacilitiesData.data';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body?.data) {
      return NextResponse.json(
        { success: false, message: "Missing 'data' in body" },
        { status: 400 }
      );
    }

    const created = await InfrastructureFacilities.create({
      InfrastructureFacilitiesData: {
        data: {
          ...body.data,
          status: body.data.status ?? 1,
        },
      },
    });

    return NextResponse.json(
      { success: true, message: 'Data stored', entry: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error storing data', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const year = searchParams.get('year') || '';
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const limit = parseInt(searchParams.get('limit'), 10) || 10;
    const sortField = searchParams.get('sortField');
    const sortOrder = searchParams.get('sortOrder');
    const sortDir = Number(sortOrder) === -1 ? -1 : 1;

    const allowedSortFields = [
      `${DATA_PREFIX}.title`,
      `${DATA_PREFIX}.smallDescription`,
      `${DATA_PREFIX}.fromDate`,
      `${DATA_PREFIX}.toDate`,
      'createdAt',
    ];
    const sortKey = allowedSortFields.includes(sortField) ? sortField : 'createdAt';

    let query = {};
    if (search) {
      query = {
        $or: [
          { [`${DATA_PREFIX}.title`]: { $regex: search, $options: 'i' } },
          { [`${DATA_PREFIX}.smallDescription`]: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const yearFilter = getFromDateYearFilter(`${DATA_PREFIX}.fromDate`, year);
    if (yearFilter) {
      query = mergeQueriesWithAnd(query, yearFilter);
    }

    const totalRecords = await InfrastructureFacilities.countDocuments(query);
    const data = await InfrastructureFacilities.find(query)
      .sort({ [sortKey]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data, totalRecords }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data', error: error.message },
      { status: 500 }
    );
  }
}
