import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import NaacAqarDocument from '../../../../models/naacAqarDocument';
import { getPublicAqarDocumentWithParts } from '../helpers';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const document = await NaacAqarDocument.findOne({ _id: id, status: true }).lean();
    if (!document) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const parts = await getPublicAqarDocumentWithParts(id, document.title);
    if (!parts.length) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

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
