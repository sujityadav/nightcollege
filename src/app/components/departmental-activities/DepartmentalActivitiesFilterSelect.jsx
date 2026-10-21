'use client';

export default function DepartmentalActivitiesFilterSelect({ value, onChange, options }) {
  return (
    <div className="relative w-full sm:w-[240px] sm:shrink-0">
      <select
        value={value}
        onChange={onChange}
        aria-label="Filter departmental activities"
        className="w-full cursor-pointer appearance-none rounded-md border border-[#BECDE3] bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-[#1B212F] shadow-sm outline-none transition-colors hover:border-[#9AADCC] focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <i
        className="pi pi-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7A94]"
        aria-hidden="true"
      />
    </div>
  );
}
