import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDARY_CLOUD_NAME,
  api_key: process.env.CLOUDARY_KEY,
  api_secret: process.env.CLOUDARY_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const results: any[] = [];

    // Get all files from form data
    // Using a type assertion to work with FormData
    const formDataObj = formData as any;
    const entries: [string, FormDataEntryValue][] = Array.from(formDataObj.entries());
    
    // Process each entry
    for (const [key, value] of entries) {
      if (value instanceof File) {
        const file = value;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Convert buffer to base64 string for Cloudinary upload
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
        
        // Upload to Cloudinary
        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            base64String,
            {
              folder: "nightcollege", // Optional folder in Cloudinary
              public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`, // Remove extension
              resource_type: "auto", // Automatically detect image, video, etc.
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result as UploadApiResponse);
              }
            }
          );
        });

        results.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
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
