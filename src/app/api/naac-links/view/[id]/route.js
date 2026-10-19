import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import NaacLink from '../../../../models/naacLink';
import { getNaacLinkDocumentViewType } from '../../../../utils/naacLinkDocument';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const item = await NaacLink.findById(id);

    if (!item || item.type !== 'Document' || !item.documentUrl) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    if (!item.status) {
      return NextResponse.json(
        {
          success: false,
          message: 'This document is inactive. Enable status from NAAC admin.',
        },
        { status: 404 }
      );
    }

    const viewType = getNaacLinkDocumentViewType(item.documentUrl, item.documentName);

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
        fileUrl: `/api/naac-links/document/${item._id}/file`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
