import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import ContactInfo from "../../models/contactInfo";

export async function GET() {
  try {
    await connectDB();
    const entry = await ContactInfo.findOne().sort({ updatedAt: -1 });

    return NextResponse.json(
      { success: true, data: entry || null },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch contact info", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body?.data) {
      return NextResponse.json(
        { success: false, message: "Missing 'data' in body" },
        { status: 400 }
      );
    }

    const googleLocation = (body.data.googleLocation || "").trim();
    const contactInfo = body.data.contactInfo || "";

    if (!googleLocation) {
      return NextResponse.json(
        { success: false, message: "Google Location is required" },
        { status: 400 }
      );
    }

    const googleMapsPattern =
      /^(https?:\/\/)?(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|goo\.gl\/maps|maps\.app\.goo\.gl)(\/|\?|#|$)/i;

    let urlToCheck = googleLocation;
    if (!/^https?:\/\//i.test(urlToCheck)) {
      urlToCheck = `https://${urlToCheck}`;
    }

    try {
      // eslint-disable-next-line no-new
      new URL(urlToCheck);
    } catch {
      return NextResponse.json(
        { success: false, message: "Please enter a valid URL" },
        { status: 400 }
      );
    }

    if (!googleMapsPattern.test(googleLocation)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid Google Maps link (e.g. https://maps.app.goo.gl/...)",
        },
        { status: 400 }
      );
    }

    const payload = {
      ContactInfoData: {
        data: {
          googleLocation,
          contactInfo,
        },
      },
    };

    const existing = await ContactInfo.findOne().sort({ updatedAt: -1 });
    let saved;

    if (existing) {
      saved = await ContactInfo.findByIdAndUpdate(
        existing._id,
        { $set: payload },
        { new: true, runValidators: true }
      );
    } else {
      saved = await ContactInfo.create(payload);
    }

    return NextResponse.json(
      { success: true, message: "Contact information saved", data: saved },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error saving contact info", error: error.message },
      { status: 500 }
    );
  }
}
