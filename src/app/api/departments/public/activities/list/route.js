import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import { ACTIVITY_FILTER_ALL } from "../../../../../lib/departmentActivityFilters";
import { DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE } from "../../../../../lib/departmentActivityFilters";
import { fetchPublicDepartmentalActivitiesPage } from "../../../../../lib/departmentalActivitiesServer";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || ACTIVITY_FILTER_ALL;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(
      searchParams.get("limit") || String(DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE),
      10
    );
    const subjectId = searchParams.get("subjectId");
    const departmentId = searchParams.get("departmentId");

    const result = await fetchPublicDepartmentalActivitiesPage({
      filter,
      page,
      limit,
      subjectId: subjectId || null,
    });

    if (departmentId && subjectId && result.data.length) {
      const mismatch = result.data.some(
        (item) => item.departmentId && item.departmentId !== departmentId
      );
      if (mismatch) {
        return NextResponse.json(
          { success: false, message: "Subject does not belong to this department" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        ...result,
        filter,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load departmental activities",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
