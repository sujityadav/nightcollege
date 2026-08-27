import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import QuickLink from '../../models/quickLink';
import { normalizeSlug, validateSlug } from '../../utils/quickLinkSlug';

const checkDuplicateSlug = async (slug, excludeId = null) => {
  const query = { slug: normalizeSlug(slug), type: 'Content' };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return QuickLink.findOne(query);
};

const validatePayload = async (data, isUpdate = false, excludeId = null) => {
  if (!isUpdate && (!data.title || data.sortOrder === undefined || data.sortOrder === '' || !data.type)) {
    return 'Title, type and sort order are required';
  }

  if (data.sortOrder !== undefined && data.sortOrder !== '' && Number.isNaN(Number(data.sortOrder))) {
    return 'Sort order must be a number';
  }

  if (data.type === 'Content') {
    const slugError = validateSlug(data.slug);
    if (slugError) return slugError;
    if (!data.content?.trim()) return 'Content is required for Content type';

    const duplicate = await checkDuplicateSlug(data.slug, excludeId);
    if (duplicate) return 'This slug is already in use';
  }

  if (data.type === 'Link') {
    const trimmed = data.linkUrl?.trim() || '';
    if (!trimmed) return 'Link URL is required for Link type';

    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return 'Link should be valid';
      }
    } catch {
      return 'Link should be valid';
    }
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
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const validationError = await validatePayload(data, false);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const entry = await QuickLink.create({
      title: data.title.trim(),
      type: data.type,
      slug: data.type === 'Content' ? normalizeSlug(data.slug) : '',
      sortOrder: Number(data.sortOrder),
      status: data.status ?? true,
      content: data.type === 'Content' ? data.content : '',
      linkUrl: data.type === 'Link' ? data.linkUrl.trim() : '',
      documentUrl: data.type === 'Document' ? data.documentUrl : '',
      documentName: data.type === 'Document' ? data.documentName || '' : '',
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
