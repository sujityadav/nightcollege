import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import NaacAqarDocumentRow from '../../../../../models/naacAqarDocumentRow';
import { validateRowLinkFields } from '../../../rowValidation';

export async function GET(req, { params }) {
  try {
    const { id, rowId } = await params;
    await connectDB();
    const row = await NaacAqarDocumentRow.findOne({ _id: rowId, documentId: id }).lean();
    return row
      ? NextResponse.json({ success: true, data: row })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id, rowId } = await params;
    await connectDB();
    const body = await req.json();
    const sectionId = body.sectionId;
    const srNo = String(body.srNo || '').trim();
    const details = String(body.details || '').trim();

    if (!sectionId) {
      return NextResponse.json({ success: false, message: 'Section is required' }, { status: 400 });
    }
    if (!srNo) {
      return NextResponse.json({ success: false, message: 'Sr. no. is required' }, { status: 400 });
    }
    if (!details) {
      return NextResponse.json({ success: false, message: 'Details is required' }, { status: 400 });
    }

    const linkFields = validateRowLinkFields(body);
    if (linkFields.error) {
      return NextResponse.json({ success: false, message: linkFields.error }, { status: 400 });
    }

    const row = await NaacAqarDocumentRow.findOneAndUpdate(
      { _id: rowId, documentId: id },
      {
        sectionId,
        srNo,
        details,
        linkType: linkFields.linkType,
        link: linkFields.link,
        documentUrl: linkFields.documentUrl,
        documentName: linkFields.documentName,
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      },
      { new: true, runValidators: true }
    );

    return row
      ? NextResponse.json({ success: true, data: row })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, rowId } = await params;
    await connectDB();
    const row = await NaacAqarDocumentRow.findOneAndDelete({ _id: rowId, documentId: id });
    return row
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
