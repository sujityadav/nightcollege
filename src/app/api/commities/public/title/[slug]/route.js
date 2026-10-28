import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../../../../../lib/mongodb';
import Commities from '../../../../../models/commities';
import MasterYear from '../../../../../models/masterYear';
import {
  committeeTitleToSlug,
  formatMasterYearLabel,
  getCommitteePayload,
  normalizeMasterYearId,
} from '../../../../../lib/committeeData';

async function resolveMasterYear(masterYearId) {
  const yearId = normalizeMasterYearId(masterYearId);
  if (!yearId) return null;

  let yearDoc = await MasterYear.findById(yearId).lean();
  if (!yearDoc && mongoose.Types.ObjectId.isValid(yearId)) {
    yearDoc = await MasterYear.findById(new mongoose.Types.ObjectId(yearId)).lean();
  }
  return yearDoc;
}

export async function GET(_req, { params }) {
  try {
    const { slug } = await params;
    const normalizedSlug = String(slug || '').toLowerCase();
    if (!normalizedSlug) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await connectDB();
    const docs = await Commities.find({}).lean();
    const matched = docs.filter((doc) => {
      const title = getCommitteePayload(doc).title?.trim();
      return title && committeeTitleToSlug(title) === normalizedSlug;
    });

    if (!matched.length) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const title = getCommitteePayload(matched[0]).title?.trim() || '';

    const entriesWithYear = [];
    for (const doc of matched) {
      const data = getCommitteePayload(doc);
      const masterYearId = normalizeMasterYearId(data.masterYearId);
      const yearDoc = await resolveMasterYear(masterYearId);
      if (!yearDoc) continue;

      entriesWithYear.push({
        id: String(doc._id),
        masterYearId,
        yearLabel: formatMasterYearLabel(yearDoc),
        fromYear: yearDoc.fromYear ?? 0,
        toYear: yearDoc.toYear ?? 0,
        sortOrder: Number(data.sortOrder) || 0,
      });
    }

    const entries = entriesWithYear.sort(
      (a, b) => b.fromYear - a.fromYear || a.sortOrder - b.sortOrder
    );

    return NextResponse.json({
      success: true,
      data: {
        title,
        slug: normalizedSlug,
        years: entries,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
