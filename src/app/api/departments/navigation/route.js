import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Departments from "../../../models/departmenst";
import InnerDepartments from "../../../models/innerdepartments";

export async function GET() {
  try {
    await connectDB();

    const [departments, subjects] = await Promise.all([
      Departments.find({})
        .sort({ "DepartmentsData.data.sortOrder": 1, createdAt: -1 })
        .lean(),
      InnerDepartments.find({})
        .sort({ "InnerDepartmentsData.data.sortOrder": 1, createdAt: -1 })
        .lean(),
    ]);

    const subjectsByDepartment = new Map();
    for (const entry of subjects) {
      const data = entry?.InnerDepartmentsData?.data;
      const departmentId = data?.depatmentId;
      const title = data?.title?.trim();
      if (!departmentId || !title) continue;

      const key = String(departmentId);
      if (!subjectsByDepartment.has(key)) {
        subjectsByDepartment.set(key, []);
      }
      subjectsByDepartment.get(key).push({
        id: String(entry._id),
        title,
      });
    }

    const menu = departments
      .map((entry) => {
        const data = entry?.DepartmentsData?.data;
        const title = data?.title?.trim();
        if (!title) return null;

        const id = String(entry._id);
        return {
          id,
          title,
          subjects: subjectsByDepartment.get(id) || [],
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data: menu }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load department navigation",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
