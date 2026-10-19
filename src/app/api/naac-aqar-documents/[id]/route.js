import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import NaacAqarDocument from '../../../models/naacAqarDocument';
import NaacAqarDocumentSection from '../../../models/naacAqarDocumentSection';
import NaacAqarDocumentRow from '../../../models/naacAqarDocumentRow';
import NaacAqarDocumentPart from '../../../models/naacAqarDocumentPart';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await NaacAqarDocument.findById(id).lean();
    if (!data) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

const PARTIAL_FIELDS = ['status'];

function parseSortOrder(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const keys = Object.keys(body || {}).filter((k) => body[k] !== undefined);

    if (keys.length > 0 && keys.every((k) => PARTIAL_FIELDS.includes(k))) {
      const data = await NaacAqarDocument.findByIdAndUpdate(
        id,
        { status: Boolean(body.status) },
        { new: true }
      );
      return data
        ? NextResponse.json({ success: true, data })
        : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const title = String(body.title || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const sortOrder = parseSortOrder(body.sortOrder);
    if (sortOrder === null) {
      return NextResponse.json(
        { success: false, message: 'Valid sort order is required (0 or greater)' },
        { status: 400 }
      );
    }

    const data = await NaacAqarDocument.findByIdAndUpdate(
      id,
      {
        title,
        description: body.description || '',
        status: body.status ?? true,
        sortOrder,
      },
      { new: true, runValidators: true }
    );

    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await NaacAqarDocument.findByIdAndDelete(id);
    if (!data) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    await NaacAqarDocumentPart.deleteMany({ documentId: id });
    await NaacAqarDocumentSection.deleteMany({ documentId: id });
    await NaacAqarDocumentRow.deleteMany({ documentId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
