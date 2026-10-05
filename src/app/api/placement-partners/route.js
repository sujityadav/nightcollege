import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import PlacementPartner from '../../models/placementPartner';

export async function POST(req) {
  try {
    await connectDB();
    const { title, image, sortNo } = await req.json();
    if (!title?.trim() || !image?.trim() || !Number.isFinite(Number(sortNo)) || Number(sortNo) < 0) {
      return NextResponse.json({ success: false, message: 'Title, image, and a valid sort number are required' }, { status: 400 });
    }
    const partner = await PlacementPartner.create({ title: title.trim(), image: image.trim(), sortNo: Number(sortNo) });
    return NextResponse.json({ success: true, data: partner }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to create placement partner' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const limit = Math.max(Number(searchParams.get('limit')) || 10, 1);
    const requestedSort = searchParams.get('sortField');
    const sortField = ['title', 'sortNo', 'createdAt', 'updatedAt'].includes(requestedSort) ? requestedSort : 'sortNo';
    const sortOrder = Number(searchParams.get('sortOrder')) === -1 ? -1 : 1;
    const search = searchParams.get('search')?.trim() || '';
    const filter = search ? { title: { $regex: search, $options: 'i' } } : {};
    const [data, totalRecords] = await Promise.all([
      PlacementPartner.find(filter).sort({ [sortField]: sortOrder }).skip((page - 1) * limit).limit(limit),
      PlacementPartner.countDocuments(filter),
    ]);
    return NextResponse.json({ success: true, data, totalRecords });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to fetch placement partners' }, { status: 500 });
  }
}
