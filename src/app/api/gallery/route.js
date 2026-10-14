import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import Gallery from '../../models/gallery';

function normalizeImages(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const normalized = images
    .filter((item) => item?.url?.trim())
    .map((item) => ({
      url: String(item.url).trim(),
      isThumbnail: Boolean(item.isThumbnail),
      addInGallery: Boolean(item.addInGallery),
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 0,
      title: String(item.title || '').trim(),
      description: String(item.description || '').trim(),
    }));

  if (!normalized.length) {
    return null;
  }

  const thumbnailCount = normalized.filter((item) => item.isThumbnail).length;
  if (thumbnailCount !== 1) {
    return { error: 'Exactly one image must be marked as thumbnail' };
  }

  for (const item of normalized) {
    const needsTitle = !item.isThumbnail || item.addInGallery;
    if (needsTitle && !item.title) {
      return { error: 'Title is required for each gallery image' };
    }
  }

  return { images: normalized };
}

function parseGallerySortOrder(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return null;
  }
  return num;
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const limit = Math.max(Number(searchParams.get('limit')) || 10, 1);
    const requestedSort = searchParams.get('sortField');
    const sortField = ['title', 'description', 'sortOrder', 'createdAt', 'updatedAt'].includes(
      requestedSort
    )
      ? requestedSort
      : 'sortOrder';
    const sortOrder = Number(searchParams.get('sortOrder')) === -1 ? -1 : 1;
    const search = searchParams.get('search')?.trim() || '';

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [data, totalRecords] = await Promise.all([
      Gallery.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
      Gallery.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data, totalRecords });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch galleries' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const title = body.title?.trim();
    const description = String(body.description || '').trim();

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const sortOrder = parseGallerySortOrder(body.sortOrder);
    if (sortOrder === null) {
      return NextResponse.json(
        { success: false, message: 'Sort order cannot be negative' },
        { status: 400 }
      );
    }

    const imageResult = normalizeImages(body.images);
    if (!imageResult || imageResult.error) {
      return NextResponse.json(
        {
          success: false,
          message: imageResult?.error || 'At least one image is required',
        },
        { status: 400 }
      );
    }

    const entry = await Gallery.create({
      title,
      description,
      sortOrder,
      status: body.status !== false,
      images: imageResult.images,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to create gallery' },
      { status: 500 }
    );
  }
}
