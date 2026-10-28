import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import InfrastructureFacilities from '../../../../models/infrastructureFacilities';
import { detectMediaType, isImageMediaType } from '@/app/lib/mediaTypes';

function isActiveStatus(status) {
  if (status === undefined || status === null || status === '') return true;
  return Number(status) === 1;
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map((entry) => {
      if (typeof entry === 'string') {
        const url = entry.trim();
        if (!url) return null;
        const mediaType = detectMediaType(url, { allowAllFiles: true });
        return { url, fileName: '', mediaType };
      }
      const url = entry?.url?.trim();
      if (!url) return null;
      const mediaType =
        entry?.mediaType || detectMediaType(url, { allowAllFiles: true });
      return {
        url,
        fileName: entry?.fileName?.trim() || '',
        mediaType,
      };
    })
    .filter(Boolean);
}

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const entry = await InfrastructureFacilities.findById(id).lean();

    if (!entry?.InfrastructureFacilitiesData?.data) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const item = entry.InfrastructureFacilitiesData.data;
    if (!isActiveStatus(item.status)) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const attachments = normalizeAttachments(item.attachments);
    const photos = attachments.filter((att) => isImageMediaType(att.mediaType, att.url));
    const files = attachments.filter((att) => !isImageMediaType(att.mediaType, att.url));

    return NextResponse.json({
      success: true,
      data: {
        id: String(entry._id),
        title: item.title?.trim() || '',
        smallDescription: item.smallDescription?.trim() || '',
        largeDescription: item.largeDescription?.trim() || '',
        fromDate: item.fromDate || null,
        toDate: item.toDate || null,
        photos,
        files,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch facility' },
      { status: 500 }
    );
  }
}
