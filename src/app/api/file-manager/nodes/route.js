import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import FileManagerNode from "@/app/models/fileManagerNode";
import { resolveUniqueFileName } from "@/app/lib/fileManagerResolve";
import { buildNodeYearScopeQuery } from "@/app/lib/fileManagerYearScope";

const sortMap = { name: "name", date: "updatedAt", size: "size" };

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "files";
    const yearLabel =
      searchParams.get("yearLabel") ||
      searchParams.get("yearId") ||
      "";
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const sortBy = sortMap[searchParams.get("sortBy")] || "name";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;
    const query = {};

    if (view === "trash") query.isTrashed = true;
    else query.isTrashed = false;
    if (view === "starred") query.isStarred = true;
    if (view === "shared") query.isShared = true;
    if (view === "recent") {
      // Recent intentionally spans years; no additional folder constraint.
    } else if (view === "files") {
      const yearScope = await buildNodeYearScopeQuery(yearLabel);
      Object.assign(query, yearScope);
      query.parentId = parentId || null;
    }
    if (type === "folders") query.type = "folder";
    if (type === "files") query.type = "file";
    if (search)
      query.name = {
        $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };

    const data = await FileManagerNode.find(query).sort({
      [sortBy]: sortOrder,
      type: -1,
      name: 1,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      name,
      type,
      parentId = null,
      yearId = null,
      yearLabel = null,
      size = 0,
      mimeType = "",
      url = "",
    } = body;
    if (!name?.trim() || !["folder", "file"].includes(type))
      return NextResponse.json(
        { success: false, message: "A name and valid type are required" },
        { status: 400 },
      );
    const year = String(yearLabel || yearId || "").trim();
    const yearScope = await buildNodeYearScopeQuery(year);
    const duplicate = await FileManagerNode.findOne({
      name: name.trim(),
      parentId: parentId || null,
      ...yearScope,
      isTrashed: false,
    });
    if (duplicate && type === "folder")
      return NextResponse.json(
        {
          success: false,
          message: "A folder with this name already exists here",
        },
        { status: 400 },
      );

    let finalName = name.trim();
    if (type === "file") {
      finalName = await resolveUniqueFileName(finalName, { parentId, year });
    }

    const parentPath = parentId
      ? (await FileManagerNode.findById(parentId))?.path || ""
      : year
        ? `My Files/${year}`
        : "Other Files";
    const node = await FileManagerNode.create({
      name: finalName,
      type,
      parentId: parentId || null,
      yearId: null,
      year,
      path: `${parentPath}/${finalName}`,
      size: Number(size) || 0,
      mimeType,
      url,
      isFolder: type === "folder",
    });
    return NextResponse.json(
      {
        success: true,
        data: node,
        ...(finalName !== name.trim() && { renamedFrom: name.trim() }),
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
