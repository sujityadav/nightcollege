import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import NaacAqarDocument from '../../../../models/naacAqarDocument';
import NaacAqarDocumentPart from '../../../../models/naacAqarDocumentPart';
import NaacAqarDocumentSection from '../../../../models/naacAqarDocumentSection';
import NaacAqarDocumentRow from '../../../../models/naacAqarDocumentRow';
import { getGroupsForPart } from '../../groupHelpers';
import { validateRowLinkFields } from '../../rowValidation';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const partId = searchParams.get('partId');

    await connectDB();
    const document = await NaacAqarDocument.findById(id).lean();
    if (!document) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (!partId) {
      return NextResponse.json({ success: false, message: 'partId is required' }, { status: 400 });
    }

    const part = await NaacAqarDocumentPart.findOne({ _id: partId, documentId: id }).lean();
    if (!part) {
      return NextResponse.json({ success: false, message: 'Part not found' }, { status: 404 });
    }

    const groups = await getGroupsForPart(id, partId);

    return NextResponse.json({
      success: true,
      data: {
        document,
        part,
        groups,
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

    const section = await NaacAqarDocumentSection.findOne({ _id: sectionId, documentId: id });
    if (!section) {
      return NextResponse.json({ success: false, message: 'Invalid section' }, { status: 400 });
    }

    const count = await NaacAqarDocumentRow.countDocuments({ documentId: id, sectionId });
    const row = await NaacAqarDocumentRow.create({
      documentId: id,
      sectionId,
      srNo,
      details,
      linkType: linkFields.linkType,
      link: linkFields.link,
      documentUrl: linkFields.documentUrl,
      documentName: linkFields.documentName,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : count,
    });

    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
