import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { fetchPublicEventById } from "../../../../lib/publicEventsServer";

export async function GET(_req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const data = await fetchPublicEventById(id);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load event",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
