import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import {
  buildFileContentApiPath,
  decodePathSegments,
  resolveFileManagerNodeByPath,
} from '@/app/lib/fileManagerResolve';
import { getFileManagerViewType } from '@/app/utils/fileManagerDocument';

export async function GET(req, { params }) {
  try {
    const { path: pathParam } = await params;
    await connectDB();

    const item = await resolveFileManagerNodeByPath(pathParam);
    if (!item?.url) {
      return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });
    }

    const viewType = getFileManagerViewType(item.url, item.name);
    if (!viewType) {
      return NextResponse.json(
        { success: false, message: 'This file type cannot be previewed' },
        { status: 400 }
      );
    }

    const segments = decodePathSegments(pathParam);

    return NextResponse.json({
      success: true,
      data: {
        title: item.name,
        fileName: item.name,
        viewType,
        fileUrl: buildFileContentApiPath(segments),
        publicPath: `/file/${segments.map(encodeURIComponent).join('/')}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
