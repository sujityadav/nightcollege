import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import AboutUs from '../../../models/aboutus';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'about';

    const entry = await AboutUs.findOne({ type }).sort({ createdAt: -1 }).lean();
    if (!entry?.Aboutusdata) {
      return NextResponse.json({ success: true, data: null });
    }

    const about = entry.Aboutusdata;

    return NextResponse.json({
      success: true,
      data: {
        title: about.title || '',
        content: about.content || '',
        photo: about.photo || '',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
