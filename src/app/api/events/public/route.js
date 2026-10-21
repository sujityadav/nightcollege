import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { fetchPublicEvents } from "../../../lib/publicEventsServer";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") ?? "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const sortOrder = parseInt(searchParams.get("sortOrder") || "-1", 10);

    const result = await fetchPublicEvents({
      year,
      page,
      limit,
      sortOrder,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
        year,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load events",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
