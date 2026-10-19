import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import NaacAqarDocument from '../../../../models/naacAqarDocument';
import NaacAqarDocumentPart from '../../../../models/naacAqarDocumentPart';
import { migrateLegacySectionsToDefaultPart } from '../../partMigration';

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
    const { id } = await params;
    await connectDB();
    const document = await NaacAqarDocument.findById(id).lean();
    if (!document) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    await migrateLegacySectionsToDefaultPart(id, document.title);

    const parts = await NaacAqarDocumentPart.find({ documentId: id })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        document,
        parts,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const document = await NaacAqarDocument.findById(id);
    if (!document) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

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

    const part = await NaacAqarDocumentPart.create({
      documentId: id,
      title,
      description: body.description || '',
      sortOrder,
    });

    return NextResponse.json({ success: true, data: part }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
