import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { fetchPublicDepartmentalActivityById } from "../../../../../lib/departmentalActivitiesServer";

export async function GET(_req, { params }) {
  try {
    await connectDB();

    const { id: activityId } = await params;
    const data = await fetchPublicDepartmentalActivityById(activityId);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Departmental activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load departmental activity",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
