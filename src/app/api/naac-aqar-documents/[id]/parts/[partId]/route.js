import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import NaacAqarDocumentPart from '../../../../../models/naacAqarDocumentPart';
import NaacAqarDocumentSection from '../../../../../models/naacAqarDocumentSection';
import NaacAqarDocumentRow from '../../../../../models/naacAqarDocumentRow';

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

export async function GET(req, { params }) {
  try {
    const { id, partId } = await params;
    await connectDB();
    const part = await NaacAqarDocumentPart.findOne({ _id: partId, documentId: id }).lean();
    if (!part) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: part });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id, partId } = await params;
    await connectDB();
    const body = await req.json();
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

    const part = await NaacAqarDocumentPart.findOneAndUpdate(
      { _id: partId, documentId: id },
      {
        title,
        description: body.description || '',
        sortOrder,
      },
      { new: true, runValidators: true }
    );

    return part
      ? NextResponse.json({ success: true, data: part })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, partId } = await params;
    await connectDB();
    const part = await NaacAqarDocumentPart.findOneAndDelete({ _id: partId, documentId: id });
    if (!part) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const sections = await NaacAqarDocumentSection.find({ documentId: id, partId }).lean();
    const sectionIds = sections.map((s) => s._id);
    if (sectionIds.length) {
      await NaacAqarDocumentRow.deleteMany({ documentId: id, sectionId: { $in: sectionIds } });
      await NaacAqarDocumentSection.deleteMany({ _id: { $in: sectionIds } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
