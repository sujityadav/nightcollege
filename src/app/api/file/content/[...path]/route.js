import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import { resolveFileManagerNodeByPath } from '@/app/lib/fileManagerResolve';
import { serveFileManagerNode } from '@/app/lib/fileManagerServe';

export async function GET(req, { params }) {
  try {
    const { path: pathParam } = await params;
    const { searchParams } = new URL(req.url);
    const download = searchParams.get('download') === '1';

    await connectDB();

    const item = await resolveFileManagerNodeByPath(pathParam);
    if (!item?.url) {
      return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });
    }

    const result = await serveFileManagerNode(item, { download });
    if (result.error) {
      return NextResponse.json({ success: false, message: result.error }, { status: result.status });
    }

    return new NextResponse(result.buffer, {
      status: 200,
      headers: result.headers,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
