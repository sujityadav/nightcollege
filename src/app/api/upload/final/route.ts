// app/api/upload/final/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rename, mkdir, readdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { connectDB } from "@/app/lib/mongodb";
import Uploads from "@/app/models/upload";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tempFileName, referenceId } = body;

    if (!tempFileName || !referenceId) {
      return NextResponse.json(
        { error: "Missing tempFileName or referenceId" },
        { status: 400 }
      );
    }

    const tempDir = path.join(process.cwd(), "public", "uploads", "temp");
    const finalDir = path.join(process.cwd(), "public", "uploads", referenceId);

    if (!fs.existsSync(tempDir)) {
      return NextResponse.json(
        { error: "Temp folder does not exist" },
        { status: 404 }
      );
    }

    // Ensure final folder exists
    if (!fs.existsSync(finalDir)) {
      await mkdir(finalDir, { recursive: true });
    }

    // Try to find the file in temp folder (match exact or partial)
    const files = await readdir(tempDir);
    const fileFound = files.find((f) => f.includes(tempFileName));

    if (!fileFound) {
      return NextResponse.json(
        { error: `File ${tempFileName} not found in temp folder` },
        { status: 404 }
      );
    }

    const oldPath = path.join(tempDir, fileFound);
    const newPath = path.join(finalDir, fileFound);

    await rename(oldPath, newPath); // Move file to final folder

    const fileUrl = `/uploads/${referenceId}/${fileFound}`;

   await connectDB();
    const savedFile = await Uploads.create({
      name: fileFound,
      url: fileUrl,
      size: fs.statSync(newPath).size,
      referenceId,
    });
    return NextResponse.json({
      message: "File saved successfully",
      savedFile,
      referenceId,
    });
  } catch (err: any) {
    console.error("Final save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
