import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import QuickLink from '../../../models/quickLink';
import { getQuickLinkPublicHref } from '../../../utils/quickLinkPublic';

export async function GET() {
  try {
    await connectDB();

    const entries = await QuickLink.find({ status: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    const data = entries
      .map((item) => {
        const href = getQuickLinkPublicHref(item);
        if (!href) return null;

        return {
          id: String(item._id),
          title: item.title || '',
          type: item.type,
          href,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
