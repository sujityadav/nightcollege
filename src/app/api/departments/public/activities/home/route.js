import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { fetchHomepageDepartmentalActivities } from "../../../../../lib/departmentalActivitiesServer";

export async function GET() {
  try {
    await connectDB();

    const data = await fetchHomepageDepartmentalActivities(4);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load homepage departmental activities",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
