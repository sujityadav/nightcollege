import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import NaacAqarDocument from '../../../../models/naacAqarDocument';
import NaacAqarDocumentPart from '../../../../models/naacAqarDocumentPart';
import NaacAqarDocumentSection from '../../../../models/naacAqarDocumentSection';
import { findSectionByName, isUnassignedSectionName } from '../../helpers';
import { migrateLegacySectionsToDefaultPart, toObjectId } from '../../partMigration';

async function findOrphanSectionByName(documentObjectId, name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;
  return NaacAqarDocumentSection.findOne({
    documentId: documentObjectId,
    name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    $or: [{ partId: null }, { partId: { $exists: false } }],
  });
}

async function ensureDocument(id) {
  return NaacAqarDocument.findById(id);
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const partId = searchParams.get('partId');

    await connectDB();
    if (!(await ensureDocument(id))) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (!partId) {
      return NextResponse.json({ success: false, message: 'partId is required' }, { status: 400 });
    }

    const part = await NaacAqarDocumentPart.findOne({ _id: partId, documentId: id }).lean();
    if (!part) {
      return NextResponse.json({ success: false, message: 'Part not found' }, { status: 404 });
    }

    await migrateLegacySectionsToDefaultPart(id);

    const documentObjectId = toObjectId(id);
    const partObjectId = toObjectId(partId);
    const sections = await NaacAqarDocumentSection.find({
      documentId: documentObjectId,
      partId: partObjectId,
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    if (!(await ensureDocument(id))) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const partId = body.partId;
    const name = String(body.name || '').trim();
    if (!partId) {
      return NextResponse.json({ success: false, message: 'Part is required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ success: false, message: 'Section name is required' }, { status: 400 });
    }
    if (isUnassignedSectionName(name)) {
      return NextResponse.json(
        { success: false, message: 'Unassigned is a system section and cannot be created manually' },
        { status: 400 }
      );
    }

    const partObjectId = toObjectId(partId);
    const documentObjectId = toObjectId(id);
    if (!partObjectId || !documentObjectId) {
      return NextResponse.json({ success: false, message: 'Invalid document or part' }, { status: 400 });
    }

    const part = await NaacAqarDocumentPart.findOne({ _id: partObjectId, documentId: documentObjectId });
    if (!part) {
      return NextResponse.json({ success: false, message: 'Part not found' }, { status: 400 });
    }

    const sortOrder =
      body.sortOrder !== undefined && body.sortOrder !== '' ? Number(body.sortOrder) : undefined;

    let existing = await findSectionByName(documentObjectId, partObjectId, name);
    if (!existing) {
      existing = await findOrphanSectionByName(documentObjectId, name);
    }

    if (existing) {
      const existingPartId = existing.partId ? String(existing.partId) : '';
      if (existingPartId && existingPartId !== String(partObjectId)) {
        existing = null;
      }
    }

    if (existing) {
      const update = { partId: partObjectId };
      if (sortOrder !== undefined && !Number.isNaN(sortOrder)) {
        update.sortOrder = sortOrder;
      }
      const section = await NaacAqarDocumentSection.findByIdAndUpdate(
        existing._id,
        { $set: update },
        { new: true, runValidators: true }
      );
      return NextResponse.json({ success: true, data: section });
    }

    const count = await NaacAqarDocumentSection.countDocuments({
      documentId: documentObjectId,
      partId: partObjectId,
    });
    const section = await NaacAqarDocumentSection.create({
      documentId: documentObjectId,
      partId: partObjectId,
      name,
      sortOrder: sortOrder !== undefined && !Number.isNaN(sortOrder) ? sortOrder : count,
    });

    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
