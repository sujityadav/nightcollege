import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import QuickLink from '../../../../models/quickLink';
import { getQuickLinkDocumentViewType } from '../../../../utils/quickLinkDocument';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const item = await QuickLink.findById(params.id);

    if (!item || item.type !== 'Document' || !item.status || !item.documentUrl) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const viewType = getQuickLinkDocumentViewType(item.documentUrl, item.documentName);

    if (!viewType) {
      return NextResponse.json(
        { success: false, message: 'This document type cannot be previewed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: item._id,
        title: item.title,
        documentUrl: item.documentUrl,
        documentName: item.documentName || '',
        viewType,
        fileUrl: `/api/quick-links/document/${item._id}/file`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
