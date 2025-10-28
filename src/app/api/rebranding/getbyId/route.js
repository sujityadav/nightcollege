import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import  Rebranding  from "../../../models/rebranding";
export async function GET(req) {
  try {
    await connectDB();
    const { id } = Object.fromEntries(new URL(req.url).searchParams);
    if (!id) {
        return NextResponse.json(
            { success: false, message: "Missing 'id' parameter" },
            { status: 400 }
        );
    }
    const entry = await Rebranding.findById(id);
    if (!entry) {
        return NextResponse.json(
            { success: false, message: "Entry not found" },
            { status: 404 }
        );
    }
    return NextResponse.json(
        { success: true, data: entry },
        { status: 200 }
    );        
  } catch (error) {
    
  }
}