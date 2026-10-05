import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import MasterYear from '@/app/models/masterYear';
import { formatMasterYearLabel } from '@/app/lib/fileManagerYearScope';

/** One “current” master year when calendar year falls in multiple ranges (e.g. prefer 2026–2027 in 2026). */
function resolveCurrentMasterYear(masterYears) {
  const calendarYear = new Date().getFullYear();
  const matching = masterYears.filter(
    (year) => calendarYear >= year.fromYear && calendarYear <= year.toYear
  );
  if (!matching.length) return null;

  const startsInCalendarYear = matching.find((year) => year.fromYear === calendarYear);
  if (startsInCalendarYear) return startsInCalendarYear;

  return matching.reduce((best, year) => (year.fromYear > best.fromYear ? year : best));
}

export async function GET() {
  try {
    await connectDB();
    const masterYears = await MasterYear.find({ status: { $ne: false } })
      .sort({ fromYear: 1, toYear: 1 })
      .lean();

    const currentMasterYear = resolveCurrentMasterYear(masterYears);
    const currentId = currentMasterYear ? String(currentMasterYear._id) : null;

    const years = masterYears.map((year) => {
      const name = formatMasterYearLabel(year.fromYear, year.toYear);
      return {
        _id: String(year._id),
        masterYearId: String(year._id),
        name,
        fromYear: year.fromYear,
        toYear: year.toYear,
        isCurrent: currentId === String(year._id),
        isArchived: false,
      };
    });

    return NextResponse.json({ success: true, data: years });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/** Years are managed in Settings → Masters → Years. */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Academic years are managed under Settings → Masters → Years.',
    },
    { status: 400 }
  );
}
