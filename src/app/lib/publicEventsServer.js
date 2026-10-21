import Events from "../models/events";
import { getFromDateYearFilter, mergeQueriesWithAnd } from "./listYearFilterOptions";

function normalizePhotoList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export function isActivePublicEventStatus(status) {
  if (status === undefined || status === null || status === "") {
    return true;
  }
  if (status === false || status === 0 || status === "0") {
    return false;
  }
  return Number(status) === 1;
}

export function mapPublicEvent(entry) {
  const data = entry?.Eventdata?.data || {};
  const photos = normalizePhotoList(data.photos || data.photo);

  return {
    id: String(entry._id),
    title: data.title?.trim() || "",
    smallDescription: data.smallDescription || "",
    description: data.largeDescription || "",
    location: data.location?.trim() || "",
    category: data.category,
    fromDate: data.fromDate || null,
    toDate: data.toDate || null,
    photos,
    imageUrl: photos[0] || "",
    status: data.status,
  };
}

export async function fetchPublicEvents({
  year = "",
  page = 1,
  limit = 12,
  sortOrder = -1,
} = {}) {
  let query = {};

  const yearFilter = getFromDateYearFilter("Eventdata.data.fromDate", year);
  if (yearFilter) {
    query = mergeQueriesWithAnd(query, yearFilter);
  }

  const entries = await Events.find(query)
    .sort({ "Eventdata.data.fromDate": sortOrder === 1 ? 1 : -1, createdAt: -1 })
    .lean();

  const activeEvents = entries
    .map(mapPublicEvent)
    .filter((event) => isActivePublicEventStatus(event.status));

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 12);
  const total = activeEvents.length;
  const start = (safePage - 1) * safeLimit;
  const data = activeEvents.slice(start, start + safeLimit);

  return {
    data,
    page: safePage,
    limit: safeLimit,
    total,
    hasMore: start + data.length < total,
  };
}

export async function fetchPublicEventById(eventId) {
  const entry = await Events.findById(eventId).lean();
  if (!entry) return null;

  const event = mapPublicEvent(entry);
  if (!isActivePublicEventStatus(event.status)) {
    return null;
  }

  return event;
}
