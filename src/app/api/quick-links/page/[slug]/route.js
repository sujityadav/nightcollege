import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import QuickLink from '../../../../models/quickLink';
import { normalizeSlug } from '../../../../utils/quickLinkSlug';

export async function GET(req, { params }) {
  try {
    const { slug: slugParam } = await params;
    await connectDB();
    const slug = normalizeSlug(slugParam);

    const item = await QuickLink.findOne({
      slug,
      type: 'Content',
    });

    if (!item) {
      return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
    }

    if (!item.status) {
      return NextResponse.json(
        { success: false, message: 'This page is inactive. Enable status from Quick Links admin.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        title: item.title,
        slug: item.slug,
        content: item.content || '',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
