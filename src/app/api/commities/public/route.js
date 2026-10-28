import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Commities from '../../../models/commities';
import { committeeTitleToSlug, getCommitteePayload } from '../../../lib/committeeData';

export async function GET() {
  try {
    await connectDB();
    const docs = await Commities.find({})
      .sort({ 'CommitiesData.data.sortOrder': 1, createdAt: -1 })
      .lean();

    const bySlug = new Map();

    for (const doc of docs) {
      const data = getCommitteePayload(doc);
      const title = data.title?.trim();
      if (!title) continue;

      const slug = committeeTitleToSlug(title);
      if (!slug) continue;

      if (!bySlug.has(slug)) {
        bySlug.set(slug, {
          id: String(doc._id),
          title,
          slug,
          sortOrder: Number(data.sortOrder) || 0,
        });
      }
    }

    const list = Array.from(bySlug.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
    );

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
