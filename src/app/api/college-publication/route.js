import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import CollegePublication from '../../models/collegePublication';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body?.data?.title || !body?.data?.description) {
      return NextResponse.json({ success: false, message: 'Title and description are required' }, { status: 400 });
    }

    const entry = await CollegePublication.create({ PublicationData: body });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to create publication' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = Number(searchParams.get('sortOrder')) || -1;
    const search = searchParams.get('search') || '';
    const filter = search
      ? {
          $or: [
            { 'PublicationData.data.title': { $regex: search, $options: 'i' } },
            { 'PublicationData.data.description': { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [data, totalRecords] = await Promise.all([
      CollegePublication.find(filter).sort({ [sortField]: sortOrder }).skip((page - 1) * limit).limit(limit),
      CollegePublication.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data, totalRecords });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Unable to fetch publications' }, { status: 500 });
  }
}
