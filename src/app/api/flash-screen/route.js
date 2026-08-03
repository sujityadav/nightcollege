import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import FlashScreen from "../../models/flashScreen";

function validateDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) {
    return "From date and To date are required";
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return "Please provide valid From and To dates";
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  if (from.getTime() > to.getTime()) {
    return "From date should be less than or equal to To date";
  }

  return "";
}

export async function GET(req) {
  try {
    await connectDB();

    const { search, page = 1, limit = 10, sortField, sortOrder } =
      Object.fromEntries(new URL(req.url).searchParams);

    let query = {};
    if (search?.trim()) {
      const term = search.trim();
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query = {
        $or: [
          { "FlashScreenData.data.photo": { $regex: escaped, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $dateToString: {
                    format: "%d/%m/%Y",
                    timezone: "UTC",
                    date: {
                      $convert: {
                        input: "$FlashScreenData.data.fromDate",
                        to: "date",
                        onError: null,
                        onNull: null,
                      },
                    },
                    onNull: "",
                  },
                },
                regex: escaped,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $dateToString: {
                    format: "%d/%m/%Y",
                    timezone: "UTC",
                    date: {
                      $convert: {
                        input: "$FlashScreenData.data.toDate",
                        to: "date",
                        onError: null,
                        onNull: null,
                      },
                    },
                    onNull: "",
                  },
                },
                regex: escaped,
                options: "i",
              },
            },
          },
        ],
      };
    }

    let sort = { createdAt: -1 };
    if (sortField) {
      const direction = Number(sortOrder) === -1 ? -1 : 1;
      sort = { [sortField]: direction };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await FlashScreen.countDocuments(query);
    const entries = await FlashScreen.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    return NextResponse.json(
      { success: true, data: entries, total },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch flash screens", error: error.message },
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

    const { photo, fromDate, toDate, status = 1 } = body.data;

    if (!photo) {
      return NextResponse.json(
        { success: false, message: "Photo is required" },
        { status: 400 }
      );
    }

    const dateError = validateDateRange(fromDate, toDate);
    if (dateError) {
      return NextResponse.json(
        { success: false, message: dateError },
        { status: 400 }
      );
    }

    const created = await FlashScreen.create({
      FlashScreenData: {
        data: {
          photo,
          fromDate,
          toDate,
          status: Number(status) === 0 ? 0 : 1,
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Flash screen created", entry: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error creating flash screen", error: error.message },
      { status: 500 }
    );
  }
}
