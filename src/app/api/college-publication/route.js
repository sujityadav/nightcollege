import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import CollegePublication from '../../models/collegePublication';
import MasterYear from '../../models/masterYear';
import { validatePublicationData } from '../../lib/collegePublicationData';

const DATA_PREFIX = 'PublicationData.data';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const validationError = validatePublicationData(body?.data);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const entry = await CollegePublication.create({ PublicationData: body });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to create publication' }, { status: 500 });
  }
}

function buildSearchFilter(search) {
  if (!search) return {};
  return {
    $or: [
      { [`${DATA_PREFIX}.title`]: { $regex: search, $options: 'i' } },
      { [`${DATA_PREFIX}.description`]: { $regex: search, $options: 'i' } },
    ],
  };
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const requestedSort = searchParams.get('sortField');
    const sortDir = Number(searchParams.get('sortOrder')) === -1 ? -1 : 1;
    const search = searchParams.get('search') || '';
    const filter = buildSearchFilter(search);
    const masterYearCollection = MasterYear.collection.name;

    const totalRecords = await CollegePublication.countDocuments(filter);
    const skip = (page - 1) * limit;

    let sortStage;
    if (requestedSort === 'year') {
      sortStage = {
        $sort: {
          yearFromYear: sortDir,
          yearToYear: sortDir,
          [`${DATA_PREFIX}.sortOrder`]: 1,
        },
      };
    } else if (requestedSort === `${DATA_PREFIX}.description`) {
      sortStage = { $sort: { [`${DATA_PREFIX}.description`]: sortDir } };
    } else if (requestedSort === `${DATA_PREFIX}.title`) {
      sortStage = { $sort: { [`${DATA_PREFIX}.title`]: sortDir } };
    } else {
      sortStage = {
        $sort: {
          [`${DATA_PREFIX}.sortOrder`]: sortDir,
          createdAt: -1,
        },
      };
    }

    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          rawMasterYearId: `$${DATA_PREFIX}.masterYearId`,
        },
      },
      {
        $addFields: {
          yearObjectId: {
            $let: {
              vars: { mid: '$rawMasterYearId' },
              in: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: [{ $type: '$$mid' }, 'objectId'] },
                      then: '$$mid',
                    },
                    {
                      case: {
                        $and: [
                          { $eq: [{ $type: '$$mid' }, 'object'] },
                          { $ifNull: ['$$mid._id', false] },
                        ],
                      },
                      then: {
                        $convert: {
                          input: '$$mid._id',
                          to: 'objectId',
                          onError: null,
                          onNull: null,
                        },
                      },
                    },
                  ],
                  default: {
                    $convert: {
                      input: '$$mid',
                      to: 'objectId',
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: masterYearCollection,
          localField: 'yearObjectId',
          foreignField: '_id',
          as: 'yearDoc',
        },
      },
      {
        $addFields: {
          yearFromYear: { $ifNull: [{ $arrayElemAt: ['$yearDoc.fromYear', 0] }, 0] },
          yearToYear: { $ifNull: [{ $arrayElemAt: ['$yearDoc.toYear', 0] }, 0] },
          yearLabel: {
            $let: {
              vars: { y: { $arrayElemAt: ['$yearDoc', 0] } },
              in: {
                $cond: [
                  { $ifNull: ['$$y.fromYear', false] },
                  {
                    $concat: [
                      { $toString: '$$y.fromYear' },
                      ' – ',
                      { $toString: '$$y.toYear' },
                    ],
                  },
                  '',
                ],
              },
            },
          },
        },
      },
      sortStage,
      { $skip: skip },
      { $limit: limit },
      { $project: { yearDoc: 0, yearObjectId: 0, yearFromYear: 0, yearToYear: 0, rawMasterYearId: 0 } },
    ];

    const data = await CollegePublication.aggregate(pipeline);

    return NextResponse.json({ success: true, data, totalRecords });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to fetch publications' }, { status: 500 });
  }
}
