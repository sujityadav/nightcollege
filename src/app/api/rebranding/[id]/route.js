import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Rebranding from "../../../models/rebranding";
import { deleteCloudinaryImage } from "../../../lib/cloudinary";

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

    // Status-only update from listing toggle
    if (body?.status !== undefined && !body?.data) {
      updated = await Rebranding.findByIdAndUpdate(
        id,
        { $set: { "RebrandingData.data.status": Number(body.status) } },
        { new: true, runValidators: true }
      );
    } else if (body?.data) {
      const existing = await Rebranding.findById(id);
      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Banner not found" },
          { status: 404 }
        );
      }

      const mergedData = {
        ...(existing.RebrandingData?.data || {}),
        ...body.data,
        sortNo:
          body.data.sortNo !== undefined && body.data.sortNo !== ""
            ? Number(body.data.sortNo)
            : existing.RebrandingData?.data?.sortNo,
        status:
          body.data.status !== undefined
            ? Number(body.data.status)
            : existing.RebrandingData?.data?.status,
      };

      const oldPhoto = existing.RebrandingData?.data?.photo || "";
      const newPhoto = mergedData.photo || "";

      // Delete previous Cloudinary asset when replaced or cleared
      if (oldPhoto && oldPhoto !== newPhoto) {
        const cleanup = await deleteCloudinaryImage(oldPhoto);
        if (!cleanup.deleted) {
          console.warn("Failed to delete old rebranding media from Cloudinary", {
            oldPhoto,
            cleanup,
          });
        }
      }

      updated = await Rebranding.findByIdAndUpdate(
        id,
        { $set: { "RebrandingData.data": mergedData } },
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
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Banner updated", data: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating banner", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const existing = await Rebranding.findById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    const photoUrl = existing?.RebrandingData?.data?.photo;
    if (photoUrl) {
      const cleanup = await deleteCloudinaryImage(photoUrl);
      if (!cleanup.deleted) {
        console.warn("Failed to delete rebranding media on record delete", {
          photoUrl,
          cleanup,
        });
      }
    }

    const deleted = await Rebranding.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Banner deleted", data: deleted },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting banner", error: error.message },
      { status: 500 }
    );
  }
}
