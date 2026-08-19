import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import QuickLink from '../../../models/quickLink';

const validatePayload = (data) => {
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

export async function GET(req, { params }) {
  try {
    await connectDB();
    const data = await QuickLink.findById(params.id);
    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const payload = await req.json();
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const updateData = {
      title: payload.title?.trim(),
      type: payload.type,
      sortOrder: Number(payload.sortOrder),
      status: payload.status,
      slug: payload.type === 'Content' ? payload.slug?.trim() : '',
      content: payload.type === 'Content' ? payload.content : '',
      linkUrl: payload.type === 'Link' ? payload.linkUrl?.trim() : '',
      documentUrl: payload.type === 'Document' ? payload.documentUrl : '',
      documentName: payload.type === 'Document' ? payload.documentName || '' : '',
    };

    const data = await QuickLink.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const data = await QuickLink.findByIdAndDelete(params.id);
    return data
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
