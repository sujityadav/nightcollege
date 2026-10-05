import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import PlacementPartner from '../../../models/placementPartner';

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const partner = await PlacementPartner.findById(id);
    if (!partner) return NextResponse.json({ success: false, message: 'Placement partner not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to fetch placement partner' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { title, image, sortNo } = await req.json();
    if (!title?.trim() || !image?.trim() || !Number.isFinite(Number(sortNo)) || Number(sortNo) < 0) {
      return NextResponse.json({ success: false, message: 'Title, image, and a valid sort number are required' }, { status: 400 });
    }
    const partner = await PlacementPartner.findByIdAndUpdate(id, { title: title.trim(), image: image.trim(), sortNo: Number(sortNo) }, { new: true, runValidators: true });
    if (!partner) return NextResponse.json({ success: false, message: 'Placement partner not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to update placement partner' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const partner = await PlacementPartner.findByIdAndDelete(id);
    if (!partner) return NextResponse.json({ success: false, message: 'Placement partner not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Placement partner deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to delete placement partner' }, { status: 500 });
  }
}
