import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Commities from '../../../../../models/commities';
import MasterYear from '../../../../../models/masterYear';
import {
  committeeTitleToSlug,
  formatMasterYearLabel,
  getCommitteeFile,
  getCommitteePayload,
  normalizeMasterYearId,
} from '../../../../../lib/committeeData';

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const doc = await Commities.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const data = getCommitteePayload(doc);
    const masterYearId = normalizeMasterYearId(data.masterYearId);
    const yearDoc = masterYearId ? await MasterYear.findById(masterYearId).lean() : null;
    const file = getCommitteeFile(data);

    return NextResponse.json({
      success: true,
      data: {
        id: String(doc._id),
        slug: committeeTitleToSlug(data.title?.trim() || ''),
        title: data.title?.trim() || '',
        smallDescription: data.smallDescription?.trim() || '',
        largeDescription: data.largeDescription || '',
        yearLabel: formatMasterYearLabel(yearDoc),
        masterYearId,
        sortOrder: Number(data.sortOrder) || 0,
        file,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
