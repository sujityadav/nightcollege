import {
  getDefaultListYearFilterValue,
  getListYearFilterEndYear,
} from "./listYearFilterOptions";

export const PUBLIC_EVENT_FILTER_ALL = "";
export const PUBLIC_EVENT_YEAR_START = 2023;

/** 4 rows × 4 columns per infinite-scroll batch */
export const PUBLIC_EVENTS_PAGE_SIZE = 16;

export function getDefaultPublicEventYearFilter(date = new Date()) {
  return getDefaultListYearFilterValue(date);
}

/** @returns {{ label: string, value: string }[]} */
export function getPublicEventYearFilterOptions(date = new Date()) {
  const end = getListYearFilterEndYear(date);
  const options = [{ label: "All Events", value: PUBLIC_EVENT_FILTER_ALL }];

  for (let year = PUBLIC_EVENT_YEAR_START; year <= end; year += 1) {
    options.push({ label: String(year), value: String(year) });
  }

  return options;
}

export function getEventDetailPath(eventId) {
  if (!eventId) return "#";
  return `/events/detail/${eventId}`;
}
