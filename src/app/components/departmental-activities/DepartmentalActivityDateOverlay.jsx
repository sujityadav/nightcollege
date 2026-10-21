'use client';

import { format } from 'date-fns';

function parseStartDate(fromDate) {
  if (!fromDate) {
    return { day: '', month: '', year: '' };
  }

  try {
    const date = new Date(fromDate);
    return {
      day: format(date, 'd'),
      month: format(date, 'MMMM'),
      year: format(date, 'yyyy'),
    };
  } catch {
    return { day: '', month: '', year: '' };
  }
}

export default function DepartmentalActivityDateOverlay({ fromDate }) {
  const { day, month, year } = parseStartDate(fromDate);

  if (!day && !month && !year) {
    return null;
  }

  return (
    <div className="absolute top-[10px] right-3 z-10 rounded-md bg-primarycolor p-1 px-3 text-center font14 text-white">
      <div className="flex gap-1">
        {day ? <span className="font-[700] text-white">{day}</span> : null}
        <p className="font-[300]">
          {month ? <span>{month}</span> : null}
          {year ? <span> {year}</span> : null}
        </p>
      </div>
    </div>
  );
}
