import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import FlashScreen from "../../../models/flashScreen";
import { deleteCloudinaryImage } from "../../../lib/cloudinary";

function validateDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) {
    return "From date and To date are required";
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return "Please provide valid From and To dates";
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  if (from.getTime() > to.getTime()) {
    return "From date should be less than or equal to To date";
  }

  return "";
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const entry = await FlashScreen.findById(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Flash screen not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: entry }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch flash screen", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id" },
        { status: 400 }
      );
    }

    let updated;

    if (body?.status !== undefined && !body?.data) {
      updated = await FlashScreen.findByIdAndUpdate(
        id,
        { $set: { "FlashScreenData.data.status": Number(body.status) } },
        { new: true, runValidators: true }
      );
    } else if (body?.data) {
      const existing = await FlashScreen.findById(id);
      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Flash screen not found" },
          { status: 404 }
        );
      }

      const mergedData = {
        ...(existing.FlashScreenData?.data || {}),
        ...body.data,
      };

      const dateError = validateDateRange(mergedData.fromDate, mergedData.toDate);
      if (dateError) {
        return NextResponse.json(
          { success: false, message: dateError },
          { status: 400 }
        );
      }

      if (!mergedData.photo) {
        return NextResponse.json(
          { success: false, message: "Photo is required" },
          { status: 400 }
        );
      }

      const oldPhoto = existing.FlashScreenData?.data?.photo || "";
      const newPhoto = mergedData.photo || "";

      if (oldPhoto && oldPhoto !== newPhoto) {
        const cleanup = await deleteCloudinaryImage(oldPhoto);
        if (!cleanup.deleted) {
          console.warn("Failed to delete old flash-screen media from Cloudinary", {
            oldPhoto,
            cleanup,
          });
        }
      }

      updated = await FlashScreen.findByIdAndUpdate(
        id,
        {
          $set: {
            "FlashScreenData.data": {
              ...mergedData,
              status:
                mergedData.status !== undefined
                  ? Number(mergedData.status)
                  : existing.FlashScreenData?.data?.status ?? 1,
            },
          },
        },
        { new: true, runValidators: true }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Missing update payload" },
        { status: 400 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Flash screen not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Flash screen updated", data: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating flash screen", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const existing = await FlashScreen.findById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Flash screen not found" },
        { status: 404 }
      );
    }

    const photoUrl = existing?.FlashScreenData?.data?.photo;
    if (photoUrl) {
      const cleanup = await deleteCloudinaryImage(photoUrl);
      if (!cleanup.deleted) {
        console.warn("Failed to delete flash-screen media on record delete", {
          photoUrl,
          cleanup,
        });
      }
    }

    const deleted = await FlashScreen.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Flash screen deleted", data: deleted },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting flash screen", error: error.message },
      { status: 500 }
    );
  }
}
