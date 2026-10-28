import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../../../../lib/mongodb';
import Commities from '../../../../models/commities';
import MasterYear from '../../../../models/masterYear';
import {
  committeeTitleToSlug,
  formatMasterYearLabel,
  getCommitteePayload,
  normalizeMasterYearId,
} from '../../../../lib/committeeData';

async function resolveMasterYear(masterYearId) {
  const yearId = normalizeMasterYearId(masterYearId);
  if (!yearId) return null;

  let yearDoc = await MasterYear.findById(yearId).lean();
  if (!yearDoc && mongoose.Types.ObjectId.isValid(yearId)) {
    yearDoc = await MasterYear.findById(new mongoose.Types.ObjectId(yearId)).lean();
  }
  return yearDoc;
}

export async function GET() {
  try {
    await connectDB();
    const docs = await Commities.find({}).lean();
    const entries = [];

    for (const doc of docs) {
      const data = getCommitteePayload(doc);
      const masterYearId = normalizeMasterYearId(data.masterYearId);
      const yearDoc = await resolveMasterYear(masterYearId);
      if (!yearDoc) continue;

      const title = data.title?.trim() || '';
      entries.push({
        id: String(doc._id),
        masterYearId,
        yearLabel: formatMasterYearLabel(yearDoc),
        fromYear: yearDoc.fromYear ?? 0,
        toYear: yearDoc.toYear ?? 0,
        title,
        slug: committeeTitleToSlug(title),
        sortOrder: Number(data.sortOrder) || 0,
      });
    }

    const years = entries.sort(
      (a, b) => b.fromYear - a.fromYear || a.sortOrder - b.sortOrder
    );

    return NextResponse.json({ success: true, data: years });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
