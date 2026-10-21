import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import InnerDepartments from "../../../../models/innerdepartments";
import { getDefaultDepartmentActivityYearFilter } from "../../../../lib/departmentActivityFilters";
import { fetchSubjectDepartmentalActivities } from "../../../../lib/departmentalActivitiesServer";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const departmentId = searchParams.get("departmentId");
    const filter = searchParams.get("filter") || getDefaultDepartmentActivityYearFilter();

    if (!subjectId) {
      return NextResponse.json(
        { success: false, message: "subjectId is required" },
        { status: 400 }
      );
    }

    const subjectEntry = await InnerDepartments.findById(subjectId).lean();
    if (!subjectEntry) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    const subjectDepartmentId = subjectEntry?.InnerDepartmentsData?.data?.depatmentId
      ? String(subjectEntry.InnerDepartmentsData.data.depatmentId)
      : "";

    if (departmentId && subjectDepartmentId && departmentId !== subjectDepartmentId) {
      return NextResponse.json(
        { success: false, message: "Subject does not belong to this department" },
        { status: 400 }
      );
    }

    const data = await fetchSubjectDepartmentalActivities(subjectId, filter);

    return NextResponse.json(
      {
        success: true,
        data,
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
