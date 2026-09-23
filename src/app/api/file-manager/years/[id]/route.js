import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import FileManagerYear from "@/app/models/fileManagerYear";
import FileManagerNode from "@/app/models/fileManagerNode";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const { action, name } = await req.json();
    if (action === "setCurrent")
      await FileManagerYear.updateMany({}, { $set: { isCurrent: false } });
    const update =
      action === "archive"
        ? { isArchived: true, isCurrent: false }
        : action === "restore"
          ? { isArchived: false }
          : action === "setCurrent"
            ? { isCurrent: true, isArchived: false }
            : { name: name?.trim() };
    if (update.name === undefined)
      return NextResponse.json(
        { success: false, message: "Year name is required" },
        { status: 400 },
      );
    const year = await FileManagerYear.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    );
    if (!year)
      return NextResponse.json(
        { success: false, message: "Year not found" },
        { status: 404 },
      );
    if (update.name)
      await FileManagerNode.updateMany(
        { yearId: id },
        { $set: { year: update.name } },
      );
    return NextResponse.json({ success: true, data: year });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    await FileManagerNode.deleteMany({ yearId: id });
    const year = await FileManagerYear.findByIdAndDelete(id);
    return year
      ? NextResponse.json({ success: true })
      : NextResponse.json(
          { success: false, message: "Year not found" },
          { status: 404 },
        );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
