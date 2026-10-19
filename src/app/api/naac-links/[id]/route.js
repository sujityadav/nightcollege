import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import NaacLink from '../../../models/naacLink';
import { buildNaacLinkWriteData, validateNaacLinkPayload } from '../naacLinkValidation';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await NaacLink.findById(id);
    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

const PARTIAL_UPDATE_FIELDS = ['status', 'sortOrder'];

const isPartialListingUpdate = (payload) => {
  const keys = Object.keys(payload || {}).filter((key) => payload[key] !== undefined);
  return keys.length > 0 && keys.every((key) => PARTIAL_UPDATE_FIELDS.includes(key));
};

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const payload = await req.json();
    const existing = await NaacLink.findById(id);

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    if (isPartialListingUpdate(payload)) {
      const updateData = {};

      if (payload.status !== undefined) {
        updateData.status = Boolean(payload.status);
      }

      if (payload.sortOrder !== undefined) {
        if (payload.sortOrder === '' || Number.isNaN(Number(payload.sortOrder))) {
          return NextResponse.json(
            { success: false, message: 'Sort order must be a number' },
            { status: 400 }
          );
        }
        updateData.sortOrder = Number(payload.sortOrder);
      }

      const data = await NaacLink.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return NextResponse.json({ success: true, data });
    }

    const fullPayload = {
      ...payload,
      section: payload.section || existing.section,
    };

    const validationError = await validateNaacLinkPayload(fullPayload, true, id);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const updateData = buildNaacLinkWriteData(fullPayload);

    const data = await NaacLink.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'This slug is already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await NaacLink.findByIdAndDelete(id);
    return data
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
