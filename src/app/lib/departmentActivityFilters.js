export const ACTIVITY_FILTER_CURRENT = 'current';
export const ACTIVITY_FILTER_ALL = 'all';
export const ACTIVITY_YEAR_START = 2023;
export const DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE = 16;

export function getActivityYearFilterEndYear(date = new Date()) {
  return date.getFullYear() + 2;
}

/** Colored cards while today is on or before the activity end date (`toDate`). */
export function isDepartmentalActivityWithinToDate(toDate, now = new Date()) {
  if (!toDate) {
    return true;
  }

  const to = new Date(toDate);
  if (Number.isNaN(to.getTime())) {
    return false;
  }

  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  return todayStart <= toEnd;
}

/** @returns {{ label: string, value: string }[]} */
export function getBrowseDepartmentActivityFilterOptions(date = new Date()) {
  const end = getActivityYearFilterEndYear(date);
  const options = [{ label: 'All Activities', value: ACTIVITY_FILTER_ALL }];

  for (let year = ACTIVITY_YEAR_START; year <= end; year += 1) {
    options.push({ label: String(year), value: String(year) });
  }

  return options;
}

export function getDefaultDepartmentActivityYearFilter(date = new Date()) {
  return String(date.getFullYear());
}

/** Subject departmental activities: All Activities + years (no Current Activities). */
export function getDepartmentActivityFilterOptions(date = new Date()) {
  return getBrowseDepartmentActivityFilterOptions(date);
}

export function isActiveDepartmentalActivityStatus(status) {
  if (status === undefined || status === null || status === "") {
    return true;
  }
  if (status === false || status === 0 || status === "0") {
    return false;
  }
  return Number(status) === 1;
}

export function isCurrentDepartmentalActivity(fromDate, toDate, now = new Date()) {
  if (!fromDate) return false;

  const from = new Date(fromDate);
  if (Number.isNaN(from.getTime())) return false;

  const fromStart = new Date(from);
  fromStart.setHours(0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  if (!toDate) {
    return todayEnd >= fromStart;
  }

  const to = new Date(toDate);
  if (Number.isNaN(to.getTime())) return false;

  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);

  return todayStart <= toEnd && todayEnd >= fromStart;
}

export function isDepartmentalActivityInYear(fromDate, year) {
  if (!fromDate || Number.isNaN(Number(year))) return false;
  const from = new Date(fromDate);
  if (Number.isNaN(from.getTime())) return false;
  return from.getFullYear() === Number(year);
}

export function filterDepartmentalActivities(activities, filter) {
  if (!Array.isArray(activities)) return [];

  if (filter === ACTIVITY_FILTER_ALL) {
    return activities;
  }

  if (filter === ACTIVITY_FILTER_CURRENT) {
    return activities.filter((item) =>
      isCurrentDepartmentalActivity(item.fromDate, item.toDate)
    );
  }

  const year = Number.parseInt(String(filter), 10);
  if (!Number.isNaN(year)) {
    return activities.filter((item) => isDepartmentalActivityInYear(item.fromDate, year));
  }

  return activities;
}
