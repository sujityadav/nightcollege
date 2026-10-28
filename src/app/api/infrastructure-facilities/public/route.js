import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import InfrastructureFacilities from '../../../models/infrastructureFacilities';

const DATA_PREFIX = 'InfrastructureFacilitiesData.data';

function isActiveStatus(status) {
  if (status === undefined || status === null || status === '') return true;
  return Number(status) === 1;
}

export async function GET() {
  try {
    await connectDB();

    const entries = await InfrastructureFacilities.find({})
      .sort({ [`${DATA_PREFIX}.title`]: 1, createdAt: -1 })
      .limit(200)
      .lean();

    const data = entries
      .filter((entry) => isActiveStatus(entry?.InfrastructureFacilitiesData?.data?.status))
      .map((entry) => {
        const item = entry.InfrastructureFacilitiesData?.data || {};
        return {
          id: String(entry._id),
          title: item.title?.trim() || 'Infrastructure',
          smallDescription: item.smallDescription?.trim() || '',
        };
      });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch infrastructure facilities' },
      { status: 500 }
    );
  }
}
