import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Rebranding from "../../models/rebranding";

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

    const payload = {
      ...body,
      data: {
        ...body.data,
        sortNo: body.data.sortNo !== undefined && body.data.sortNo !== ""
          ? Number(body.data.sortNo)
          : body.data.sortNo,
        status: body.data.status !== undefined ? Number(body.data.status) : 1,
      },
    };

    const created = await Rebranding.create({
      RebrandingData: payload,
    });

    return NextResponse.json(
      { success: true, message: "Data stored", entry: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error storing data", error: error.message },
      { status: 500 }
    );
  }
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
      const orConditions = [
        { "RebrandingData.data.title": { $regex: escaped, $options: "i" } },
        { "RebrandingData.data.description": { $regex: escaped, $options: "i" } },
        // Sort number (number or legacy string)
        {
          $expr: {
            $regexMatch: {
              input: { $toString: { $ifNull: ["$RebrandingData.data.sortNo", ""] } },
              regex: escaped,
              options: "i",
            },
          },
        },
      ];

      const sortNoNum = Number(term);
      if (!Number.isNaN(sortNoNum) && term !== "") {
        orConditions.push({ "RebrandingData.data.sortNo": sortNoNum });
      }

      // Date search variants:
      // - full: 30/06/2026, 2026-06-30
      // - partial: 30/06 → also match ISO ...-06-30...
      const dateVariants = new Set([term]);
      const dmyFull = term.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (dmyFull) {
        const day = dmyFull[1].padStart(2, "0");
        const month = dmyFull[2].padStart(2, "0");
        const year = dmyFull[3];
        dateVariants.add(`${year}-${month}-${day}`);
        dateVariants.add(`${day}/${month}/${year}`);
        dateVariants.add(`${day}-${month}-${year}`);
      }
      const ymdFull = term.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
      if (ymdFull) {
        const year = ymdFull[1];
        const month = ymdFull[2].padStart(2, "0");
        const day = ymdFull[3].padStart(2, "0");
        dateVariants.add(`${year}-${month}-${day}`);
        dateVariants.add(`${day}/${month}/${year}`);
      }
      // Partial day/month like 30/06 or 30-06
      const dmPartial = term.match(/^(\d{1,2})[/-](\d{1,2})$/);
      if (dmPartial) {
        const day = dmPartial[1].padStart(2, "0");
        const month = dmPartial[2].padStart(2, "0");
        dateVariants.add(`${day}/${month}`);
        dateVariants.add(`${day}-${month}`);
        dateVariants.add(`-${month}-${day}`); // matches 2026-06-30T...
        dateVariants.add(`${month}-${day}`);
      }
      // Partial month/year like 06/2026
      const myPartial = term.match(/^(\d{1,2})[/-](\d{4})$/);
      if (myPartial) {
        const month = myPartial[1].padStart(2, "0");
        const year = myPartial[2];
        dateVariants.add(`${year}-${month}`);
        dateVariants.add(`/${month}/${year}`);
        dateVariants.add(`-${month}-${year}`);
      }

      for (const variant of dateVariants) {
        const variantEscaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        orConditions.push(
          { "RebrandingData.data.fromDate": { $regex: variantEscaped, $options: "i" } },
          { "RebrandingData.data.toDate": { $regex: variantEscaped, $options: "i" } }
        );
      }

      // Match display format DD/MM/YYYY and partial DD/MM (UTC + Asia/Kolkata)
      const dateFormatExpr = (fieldPath, timezone) => ({
        $expr: {
          $regexMatch: {
            input: {
              $dateToString: {
                format: "%d/%m/%Y",
                timezone,
                date: {
                  $convert: {
                    input: fieldPath,
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
      });

      orConditions.push(
        dateFormatExpr("$RebrandingData.data.fromDate", "UTC"),
        dateFormatExpr("$RebrandingData.data.toDate", "UTC"),
        dateFormatExpr("$RebrandingData.data.fromDate", "Asia/Kolkata"),
        dateFormatExpr("$RebrandingData.data.toDate", "Asia/Kolkata")
      );

      query = { $or: orConditions };
    }

    // Honor column sort from the table; fall back to sortNo ascending
    let sort = { "RebrandingData.data.sortNo": 1, createdAt: 1 };
    if (sortField) {
      const direction = Number(sortOrder) === -1 ? -1 : 1;
      sort = { [sortField]: direction };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Rebranding.countDocuments(query);
    const entries = await Rebranding.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    return NextResponse.json(
      { success: true, data: entries, total },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}
