import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import NaacAqarDocument from '../../../models/naacAqarDocument';
import { filterDocumentsWithPublicIndexData } from './helpers';

export async function GET() {
  try {
    await connectDB();
    const documents = await NaacAqarDocument.find({ status: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title status sortOrder createdAt updatedAt')
      .lean();

    const data = await filterDocumentsWithPublicIndexData(documents);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
