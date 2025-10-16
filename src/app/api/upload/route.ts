import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tempDir = path.join(process.cwd(), "public", "uploads", "temp");

    if (!fs.existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    const results: any[] = [];

    // Convert iterator to array to avoid TS ES5 issue
    const entries = Array.from(formData.entries());

    // Use for...of with await
    for (const [key, value] of entries) {
      if (value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}-${value.name}`;
        const filePath = path.join(tempDir, fileName);

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/temp/${fileName}`;

        results.push({
          url: fileUrl,
          name: value.name,
          size: value.size,
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
