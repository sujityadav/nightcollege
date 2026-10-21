import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import InnerDepartments from "../../../../models/innerdepartments";
import SubDepartments from "../../../../models/subdepartments";
import { buildSubjectSubPointFilter } from "../../../../lib/departmentalActivitiesServer";
function mapSubPoint(entry) {
  const data = entry?.SubDepartmentsData?.data || {};
  return {
    id: String(entry._id),
    title: data.title?.trim() || "",
    icon: data.icon?.trim() || "pi pi-file",
    smallDescription: data.smallDescription || "",
    description: data.largeDescription || "",
    sortOrder: Number(data.sortOrder) || 0,
    hasActivities: Boolean(data.hasActivities),
  };
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const departmentId = searchParams.get("departmentId");

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

    const subjectData = subjectEntry?.InnerDepartmentsData?.data || {};
    const subjectDepartmentId = subjectData.depatmentId
      ? String(subjectData.depatmentId)
      : "";

    if (departmentId && subjectDepartmentId && departmentId !== subjectDepartmentId) {
      return NextResponse.json(
        { success: false, message: "Subject does not belong to this department" },
        { status: 400 }
      );
    }

    const subPointEntries = await SubDepartments.find(buildSubjectSubPointFilter(subjectId))
      .sort({ "SubDepartmentsData.data.sortOrder": 1, createdAt: -1 })
      .lean();

    const subPoints = subPointEntries.map(mapSubPoint).filter((item) => item.title);
    const hasDepartmentalActivities = subPoints.some((item) => item.hasActivities);

    return NextResponse.json(
      {
        success: true,
        data: {
          departmentId: subjectDepartmentId,
          subject: {
            id: String(subjectEntry._id),
            title: subjectData.title?.trim() || "",
            smallDescription: subjectData.smallDescription || "",
            description: subjectData.largeDescription || "",
          },
          subPoints,
          hasDepartmentalActivities,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load subject page",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
