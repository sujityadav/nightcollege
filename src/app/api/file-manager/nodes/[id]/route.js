import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import FileManagerNode from "@/app/models/fileManagerNode";

async function descendants(rootId) {
  const collected = [String(rootId)];
  let level = [String(rootId)];
  while (level.length) {
    const children = await FileManagerNode.find({
      parentId: { $in: level },
    }).select("_id");
    level = children.map((item) => String(item._id));
    collected.push(...level);
  }
  return collected;
}

async function copyBranch(source, parentId, yearId, year, parentPath) {
  const clone = await FileManagerNode.create({
    ...source.toObject(),
    _id: undefined,
    name: `${source.name} copy`,
    parentId,
    yearId,
    year,
    path: `${parentPath}/${source.name} copy`,
    isTrashed: false,
    isStarred: false,
    createdAt: undefined,
    updatedAt: undefined,
  });
  if (source.type === "folder") {
    const children = await FileManagerNode.find({
      parentId: String(source._id),
      isTrashed: false,
    });
    for (const child of children)
      await copyBranch(child, String(clone._id), yearId, year, clone.path);
  }
  return clone;
}

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const data = await FileManagerNode.findById(params.id);
    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json(
          { success: false, message: "Item not found" },
          { status: 404 },
        );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const node = await FileManagerNode.findById(params.id);
    if (!node)
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 },
      );

    if (body.action === "toggleStar") node.isStarred = !node.isStarred;
    else if (body.action === "share") node.isShared = true;
    else if (body.action === "restore") {
      const ids = await descendants(node._id);
      await FileManagerNode.updateMany(
        { _id: { $in: ids } },
        { $set: { isTrashed: false } },
      );
      return NextResponse.json({ success: true });
    } else if (body.action === "rename") {
      if (!body.name?.trim())
        return NextResponse.json(
          { success: false, message: "Name is required" },
          { status: 400 },
        );
      const oldPath = node.path;
      node.name = body.name.trim();
      node.path = `${oldPath.slice(0, oldPath.lastIndexOf("/") + 1)}${node.name}`;
      await FileManagerNode.updateMany(
        {
          path: {
            $regex: `^${oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`,
          },
        },
        [
          {
            $set: {
              path: {
                $replaceOne: {
                  input: "$path",
                  find: oldPath,
                  replacement: node.path,
                },
              },
            },
          },
        ],
      );
    } else if (body.action === "move") {
      const ids = await descendants(node._id);
      if (body.parentId && ids.includes(String(body.parentId)))
        return NextResponse.json(
          {
            success: false,
            message:
              "An item cannot be moved into itself or one of its subfolders",
          },
          { status: 400 },
        );
      const target = body.parentId
        ? await FileManagerNode.findById(body.parentId)
        : null;
      const oldPath = node.path;
      node.parentId = body.parentId || null;
      node.yearId = body.yearId || null;
      node.year = body.year || "";
      node.path = `${target?.path || (node.year ? `My Files/${node.year}` : "Other Files")}/${node.name}`;
      await FileManagerNode.updateMany(
        { _id: { $in: ids.filter((id) => id !== String(node._id)) } },
        [
          {
            $set: {
              yearId: node.yearId,
              year: node.year,
              path: {
                $replaceOne: {
                  input: "$path",
                  find: oldPath,
                  replacement: node.path,
                },
              },
            },
          },
        ],
      );
    } else if (body.action === "copy") {
      const target = body.parentId
        ? await FileManagerNode.findById(body.parentId)
        : null;
      const data = await copyBranch(
        node,
        body.parentId || null,
        body.yearId || node.yearId,
        body.year || node.year,
        target?.path || (body.year ? `My Files/${body.year}` : "Other Files"),
      );
      return NextResponse.json({ success: true, data });
    } else
      return NextResponse.json(
        { success: false, message: "Unsupported action" },
        { status: 400 },
      );

    await node.save();
    return NextResponse.json({ success: true, data: node });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    const ids = await descendants(params.id);
    await FileManagerNode.updateMany(
      { _id: { $in: ids } },
      { $set: { isTrashed: true } },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
