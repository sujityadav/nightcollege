import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import CollegePublication from '../../../models/collegePublication';
import { validatePublicationData } from '../../../lib/collegePublicationData';

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const publication = await CollegePublication.findById(id);
    if (!publication) return NextResponse.json({ success: false, message: 'Publication not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: publication });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to fetch publication' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const validationError = validatePublicationData(body?.data);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const publication = await CollegePublication.findByIdAndUpdate(
      id,
      { 'PublicationData.data': body.data },
      { new: true, runValidators: true }
    );
    if (!publication) return NextResponse.json({ success: false, message: 'Publication not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: publication });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to update publication' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const publication = await CollegePublication.findByIdAndDelete(id);
    if (!publication) return NextResponse.json({ success: false, message: 'Publication not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Publication deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to delete publication' }, { status: 500 });
  }
}
