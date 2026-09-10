import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Departments from "../../../models/departmenst";
import InnerDepartments from "../../../models/innerdepartments";
import SubDepartments from "../../../models/subdepartments";
import DepartmentlActivity from "../../../models/departmentalactivity";
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
     console.log("body", body.data);
    const updated = await Departments.findByIdAndUpdate(
  id,
  { 'DepartmentsData.data': body.data }, // ✅ correct path
  { new: true, runValidators: true }
);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Event updated', data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating event', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const department = await Departments.findById(id);
    if (!department) {
      return NextResponse.json({ success: false, message: 'Departments not found' }, { status: 404 });
    }

    const subjects = await InnerDepartments.find({
      'InnerDepartmentsData.data.depatmentId': id,
    });
    const subjectIds = subjects.map((subject) => subject._id.toString());

    const subPoints = subjectIds.length
      ? await SubDepartments.find({
          'SubDepartmentsData.data.SubdepatmentId': { $in: subjectIds },
        })
      : [];
    const subPointIds = subPoints.map((subPoint) => subPoint._id.toString());

    if (subPointIds.length) {
      await DepartmentlActivity.deleteMany({
        'DepartmentlActivityData.data.subDepartmentId': { $in: subPointIds },
      });
    }

    if (subjectIds.length) {
      await SubDepartments.deleteMany({
        'SubDepartmentsData.data.SubdepatmentId': { $in: subjectIds },
      });
    }

    await InnerDepartments.deleteMany({
      'InnerDepartmentsData.data.depatmentId': id,
    });

    await Departments.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Department and related data deleted successfully',
        data: department,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error deleting department', error: error.message },
      { status: 500 }
    );
  }
}