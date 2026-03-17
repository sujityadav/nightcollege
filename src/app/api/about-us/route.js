import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import AboutUs from "../../models/aboutus";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("body", body);

    if (!body?.data) {
      return NextResponse.json(
        { success: false, message: "Missing 'data' in body" },
        { status: 400 }
      );
    }

    // Define unique condition (IMPORTANT)
    const filter = { type: body.type }; 
    // or { _id: body._id } if you want single record

    const updated = await AboutUs.findOneAndUpdate(
      filter,
      {
        $set: {
          title: body?.title,
          Aboutusdata: body,
          type: body.type
        }
      },
      {
        new: true,       // return updated doc
        upsert: true     // create if not exists
      }
    );

    return NextResponse.json(
      { success: true, message: "Data saved/updated", entry: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error storing data", error: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch all AboutUs entries
export async function GET(req) {
  try {
    await connectDB();
   const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const entries = await AboutUs.find({type:type}).sort({ createdAt: -1 }); // latest first

    return NextResponse.json(
      { success: true, data: entries },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}

