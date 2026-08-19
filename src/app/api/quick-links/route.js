import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import QuickLink from '../../models/quickLink';

const validatePayload = (data, isUpdate = false) => {
  if (!isUpdate && (!data.title || data.sortOrder === undefined || data.sortOrder === '' || !data.type)) {
    return 'Title, type and sort order are required';
  }

  if (data.sortOrder !== undefined && data.sortOrder !== '' && Number.isNaN(Number(data.sortOrder))) {
    return 'Sort order must be a number';
  }

  if (data.type === 'Content') {
    if (!data.slug?.trim()) return 'Slug is required for Content type';
    if (/\s/.test(data.slug)) return 'Slug cannot contain spaces';
    if (!data.content?.trim()) return 'Content is required for Content type';
  }

  if (data.type === 'Link' && !data.linkUrl?.trim()) {
    return 'Link URL is required for Link type';
  }

  if (data.type === 'Document' && !data.documentUrl?.trim()) {
    return 'Document is required for Document type';
  }

  return null;
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            { type: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await QuickLink.countDocuments(query);
    const data = await QuickLink.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data, total });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const validationError = validatePayload(data);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const entry = await QuickLink.create({
      title: data.title.trim(),
      type: data.type,
      slug: data.type === 'Content' ? data.slug.trim() : '',
      sortOrder: Number(data.sortOrder),
      status: data.status ?? true,
      content: data.type === 'Content' ? data.content : '',
      linkUrl: data.type === 'Link' ? data.linkUrl.trim() : '',
      documentUrl: data.type === 'Document' ? data.documentUrl : '',
      documentName: data.type === 'Document' ? data.documentName || '' : '',
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
