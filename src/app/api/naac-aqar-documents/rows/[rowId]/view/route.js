import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import NaacAqarDocument from '../../../../../models/naacAqarDocument';
import NaacAqarDocumentRow from '../../../../../models/naacAqarDocumentRow';
import { getAqarRowDocumentViewType } from '../../../../../utils/aqarRowDocument';

export async function GET(req, { params }) {
  try {
    const { rowId } = await params;
    await connectDB();
    const row = await NaacAqarDocumentRow.findById(rowId).lean();
    if (!row || row.linkType !== 'document' || !row.documentUrl) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const document = await NaacAqarDocument.findOne({ _id: row.documentId, status: true }).lean();
    if (!document) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const viewType = getAqarRowDocumentViewType(row.documentUrl, row.documentName);
    if (!viewType) {
      return NextResponse.json(
        { success: false, message: 'This document type cannot be previewed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: row._id,
        title: row.details,
        documentUrl: row.documentUrl,
        documentName: row.documentName || '',
        viewType,
        fileUrl: `/api/naac-aqar-documents/rows/${row._id}/file`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
