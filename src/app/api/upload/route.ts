import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { deleteCloudinaryImage } from "@/app/lib/cloudinary";

function ensureCloudinaryConfig() {
  cloudinary.config({
    cloud_name: (process.env.CLOUDARY_CLOUD_NAME || "").trim(),
    api_key: (process.env.CLOUDARY_KEY || "").trim(),
    api_secret: (process.env.CLOUDARY_SECRET || "").trim(),
    secure: true,
  });
}

function sanitizePublicId(fileName: string) {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return `${Date.now()}-${base}`
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    ensureCloudinaryConfig();
    const formData = await req.formData();
    const results: any[] = [];

    const formDataObj = formData as any;
    const entries: [string, FormDataEntryValue][] = Array.from(formDataObj.entries());

    for (const [, value] of entries) {
      if (value instanceof File) {
        const file = value;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            base64String,
            {
              folder: "nightcollege",
              public_id: sanitizePublicId(file.name),
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as UploadApiResponse);
            }
          );
        });

        results.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          resource_type: uploadResult.resource_type,
          name: file.name,
          size: file.size,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
        });
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { errorMessage: "No files uploaded", result: [] },
        { status: 400 }
      );
    }

    return NextResponse.json({
      errorMessage: "",
      result: results,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { errorMessage: err.message, result: [] },
      { status: 500 }
    );
  }
}

/** Delete a Cloudinary asset by delivery URL (used when replacing/removing media). */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json(
        { success: false, message: "Missing url" },
        { status: 400 }
      );
    }

    const result = await deleteCloudinaryImage(url);
    return NextResponse.json({
      success: Boolean(result.deleted),
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Delete failed" },
      { status: 500 }
    );
  }
}
