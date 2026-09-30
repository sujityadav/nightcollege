import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import MasterYear from '../../../models/masterYear';

const parseYear = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1900 || num > 2100) return null;
  return num;
};

const validateYears = (fromYear, toYear) => {
  if (fromYear === null || toYear === null) {
    return 'From year and to year are required';
  }
  if (fromYear > toYear) {
    return 'From year cannot be greater than to year';
  }
  return null;
};

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await MasterYear.findById(id);
    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();

    if (body.status !== undefined && body.fromYear === undefined && body.toYear === undefined) {
      const data = await MasterYear.findByIdAndUpdate(
        id,
        { status: Boolean(body.status) },
        { new: true, runValidators: true }
      );
      return data
        ? NextResponse.json({ success: true, data })
        : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const fromYear = parseYear(body.fromYear);
    const toYear = parseYear(body.toYear);
    const validationError = validateYears(fromYear, toYear);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const data = await MasterYear.findByIdAndUpdate(
      id,
      {
        fromYear,
        toYear,
        status: body.status ?? true,
      },
      { new: true, runValidators: true }
    );

    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'This year range already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await MasterYear.findByIdAndDelete(id);
    return data
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
