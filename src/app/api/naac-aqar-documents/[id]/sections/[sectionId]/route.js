import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import NaacAqarDocumentSection from '../../../../../models/naacAqarDocumentSection';
import NaacAqarDocumentRow from '../../../../../models/naacAqarDocumentRow';
import {
  findSectionByName,
  getOrCreateUnassignedSection,
  isUnassignedSection,
  isUnassignedSectionName,
} from '../../../helpers';

export async function PUT(req, { params }) {
  try {
    const { id, sectionId } = await params;
    await connectDB();
    const body = await req.json();
    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json({ success: false, message: 'Section name is required' }, { status: 400 });
    }
    if (isUnassignedSectionName(name)) {
      return NextResponse.json(
        { success: false, message: 'Unassigned is a system section name and cannot be used' },
        { status: 400 }
      );
    }

    const currentSection = await NaacAqarDocumentSection.findOne({ _id: sectionId, documentId: id });
    if (!currentSection) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const duplicate = await findSectionByName(id, currentSection.partId, name);
    if (duplicate && String(duplicate._id) !== String(sectionId)) {
      return NextResponse.json(
        { success: false, message: 'A section with this name already exists' },
        { status: 400 }
      );
    }

    const section = await NaacAqarDocumentSection.findOneAndUpdate(
      { _id: sectionId, documentId: id },
      {
        name,
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      },
      { new: true }
    );

    return section
      ? NextResponse.json({ success: true, data: section })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, sectionId } = await params;
    await connectDB();
    const section = await NaacAqarDocumentSection.findOne({
      _id: sectionId,
      documentId: id,
    });
    if (!section) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    if (isUnassignedSection(section)) {
      return NextResponse.json(
        { success: false, message: 'The Unassigned section cannot be deleted' },
        { status: 400 }
      );
    }

    const unassigned = await getOrCreateUnassignedSection(id, section.partId);
    await NaacAqarDocumentRow.updateMany({ sectionId }, { sectionId: unassigned._id });
    await NaacAqarDocumentSection.findByIdAndDelete(sectionId);

    return NextResponse.json({ success: true, data: { movedToSectionId: unassigned._id } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
