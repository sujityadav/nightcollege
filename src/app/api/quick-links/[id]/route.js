import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import QuickLink from '../../../models/quickLink';
import { normalizeSlug, validateSlug } from '../../../utils/quickLinkSlug';

const checkDuplicateSlug = async (slug, excludeId = null) => {
  const query = { slug: normalizeSlug(slug), type: 'Content' };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return QuickLink.findOne(query);
};

const validatePayload = async (data, excludeId = null) => {
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

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await QuickLink.findById(id);
    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const payload = await req.json();
    const validationError = await validatePayload(payload, id);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const updateData = {
      title: payload.title?.trim(),
      type: payload.type,
      sortOrder: Number(payload.sortOrder),
      status: payload.status,
      slug: payload.type === 'Content' ? normalizeSlug(payload.slug) : '',
      content: payload.type === 'Content' ? payload.content : '',
      linkUrl: payload.type === 'Link' ? payload.linkUrl?.trim() : '',
      documentUrl: payload.type === 'Document' ? payload.documentUrl : '',
      documentName: payload.type === 'Document' ? payload.documentName || '' : '',
    };

    const data = await QuickLink.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await QuickLink.findByIdAndDelete(id);
    return data
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
