import { Types } from "mongoose";
import SubDepartments from "../models/subdepartments";
import DepartmentlActivity from "../models/departmentalactivity";
import InnerDepartments from "../models/innerdepartments";
import Departments from "../models/departmenst";
import {
  ACTIVITY_FILTER_ALL,
  ACTIVITY_FILTER_CURRENT,
  DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE,
  filterDepartmentalActivities,
  isActiveDepartmentalActivityStatus,
} from "./departmentActivityFilters";

export function normalizeMongoId(value) {
  if (value == null) return "";
  return String(value);
}

export function buildIdVariants(ids) {
  const variants = new Set();
  for (const id of ids) {
    const asString = normalizeMongoId(id);
    if (!asString) continue;
    variants.add(asString);
    if (Types.ObjectId.isValid(asString)) {
      variants.add(new Types.ObjectId(asString));
    }
  }
  return [...variants];
}

export function buildSubjectSubPointFilter(subjectId) {
  return {
    "SubDepartmentsData.data.SubdepatmentId": {
      $in: buildIdVariants([subjectId]),
    },
  };
}

export function mapDepartmentalActivity(entry) {
  const data = entry?.DepartmentlActivityData?.data || {};
  return {
    id: String(entry._id),
    subDepartmentId: data.subDepartmentId ? normalizeMongoId(data.subDepartmentId) : "",
    title: data.title?.trim() || "",
    smallDescription: data.smallDescription || "",
    description: data.largeDescription || "",
    category: data.category,
    location: data.location || "",
    fromDate: data.fromDate || null,
    toDate: data.toDate || null,
    photos: data.photos || data.photoUrls || [],
    status: data.status,
  };
}

export async function getActivitySubPointIdsForSubject(subjectId) {
  const subPointEntries = await SubDepartments.find(buildSubjectSubPointFilter(subjectId))
    .select("_id SubDepartmentsData.data.hasActivities")
    .lean();

  return subPointEntries
    .filter((entry) => Boolean(entry?.SubDepartmentsData?.data?.hasActivities))
    .map((entry) => normalizeMongoId(entry._id));
}

export async function fetchSubjectDepartmentalActivities(subjectId, filter) {
  const activitySubPointIds = await getActivitySubPointIdsForSubject(subjectId);

  if (!activitySubPointIds.length) {
    return [];
  }

  const allowedSubPointIds = new Set(activitySubPointIds.map(normalizeMongoId));

  const activityEntries = await DepartmentlActivity.find({
    "DepartmentlActivityData.data.subDepartmentId": {
      $in: buildIdVariants(activitySubPointIds),
    },
  })
    .sort({ createdAt: -1 })
    .lean();

  const activeActivities = activityEntries
    .map(mapDepartmentalActivity)
    .filter((item) => allowedSubPointIds.has(normalizeMongoId(item.subDepartmentId)))
    .filter((item) => isActiveDepartmentalActivityStatus(item.status));

  const filtered = filterDepartmentalActivities(activeActivities, filter);
  return sortActivitiesByFromDate(filtered, "asc");
}

function sortActivitiesByFromDate(activities, order = "asc") {
  return [...activities].sort((a, b) => {
    const aTime = a?.fromDate ? new Date(a.fromDate).getTime() : 0;
    const bTime = b?.fromDate ? new Date(b.fromDate).getTime() : 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return order === "asc" ? aTime - bTime : bTime - aTime;
  });
}

export async function fetchHomepageDepartmentalActivities(limit = 4) {
  const subPointEntries = await SubDepartments.find({
    "SubDepartmentsData.data.hasActivities": true,
  })
    .select("_id SubDepartmentsData.data.SubdepatmentId")
    .lean();

  const subPointToSubject = new Map();
  const subPointIds = [];

  for (const entry of subPointEntries) {
    const subPointId = normalizeMongoId(entry._id);
    const subjectId = normalizeMongoId(entry?.SubDepartmentsData?.data?.SubdepatmentId);
    if (!subPointId || !subjectId) continue;
    subPointIds.push(subPointId);
    subPointToSubject.set(subPointId, subjectId);
  }

  if (!subPointIds.length) {
    return [];
  }

  const allowedSubPointIds = new Set(subPointIds);

  const activityEntries = await DepartmentlActivity.find({
    "DepartmentlActivityData.data.subDepartmentId": {
      $in: buildIdVariants(subPointIds),
    },
  }).lean();

  const currentActivities = activityEntries
    .map(mapDepartmentalActivity)
    .filter((item) => allowedSubPointIds.has(normalizeMongoId(item.subDepartmentId)))
    .filter((item) => isActiveDepartmentalActivityStatus(item.status));

  const filtered = filterDepartmentalActivities(
    currentActivities,
    ACTIVITY_FILTER_CURRENT
  );

  const sorted = sortActivitiesByFromDate(filtered, "asc").slice(0, limit);

  const subjectIds = [
    ...new Set(
      sorted
        .map((activity) => subPointToSubject.get(normalizeMongoId(activity.subDepartmentId)))
        .filter(Boolean)
    ),
  ];

  const subjectEntries = subjectIds.length
    ? await InnerDepartments.find({
        _id: { $in: buildIdVariants(subjectIds) },
      }).lean()
    : [];

  const subjectMap = new Map();
  const departmentIds = new Set();

  for (const entry of subjectEntries) {
    const data = entry?.InnerDepartmentsData?.data || {};
    const subjectId = normalizeMongoId(entry._id);
    const departmentId = normalizeMongoId(data.depatmentId);
    subjectMap.set(subjectId, {
      title: data.title?.trim() || "",
      departmentId,
    });
    if (departmentId) departmentIds.add(departmentId);
  }

  const departmentEntries = departmentIds.size
    ? await Departments.find({
        _id: { $in: buildIdVariants([...departmentIds]) },
      }).lean()
    : [];

  const departmentMap = new Map();
  for (const entry of departmentEntries) {
    const title = entry?.DepartmentsData?.data?.title?.trim() || "";
    departmentMap.set(normalizeMongoId(entry._id), title);
  }

  return sorted.map((activity) => {
    const subPointId = normalizeMongoId(activity.subDepartmentId);
    const subjectId = subPointToSubject.get(subPointId) || "";
    const subject = subjectMap.get(subjectId) || { title: "", departmentId: "" };
    const departmentName = departmentMap.get(subject.departmentId) || "";
    const subjectName = subject.title || "";

    let footerLabel = "";
    if (departmentName && subjectName) {
      footerLabel = `${departmentName} (${subjectName})`;
    } else {
      footerLabel = departmentName || subjectName;
    }

    const subjectPageHref =
      subject.departmentId && subjectId
        ? `/departments?departmentId=${subject.departmentId}&subjectId=${subjectId}`
        : "/departments";

    return {
      ...activity,
      departmentId: subject.departmentId,
      subjectId,
      departmentName,
      subjectName,
      footerLabel,
      href: subjectPageHref,
      subjectPageHref,
    };
  });
}

async function resolveActivityHierarchy(subDepartmentId) {
  const subPointId = normalizeMongoId(subDepartmentId);
  if (!subPointId) return null;

  const subPoint = await SubDepartments.findOne({
    _id: { $in: buildIdVariants([subPointId]) },
  }).lean();

  if (!subPoint?.SubDepartmentsData?.data?.hasActivities) {
    return null;
  }

  const subjectId = normalizeMongoId(subPoint.SubDepartmentsData.data.SubdepatmentId);
  if (!subjectId) return null;

  const subjectEntry = await InnerDepartments.findOne({
    _id: { $in: buildIdVariants([subjectId]) },
  }).lean();

  const subjectData = subjectEntry?.InnerDepartmentsData?.data || {};
  const departmentId = normalizeMongoId(subjectData.depatmentId);
  const subjectName = subjectData.title?.trim() || "";

  let departmentName = "";
  if (departmentId) {
    const departmentEntry = await Departments.findOne({
      _id: { $in: buildIdVariants([departmentId]) },
    }).lean();
    departmentName = departmentEntry?.DepartmentsData?.data?.title?.trim() || "";
  }

  const subjectPageHref =
    departmentId && subjectId
      ? `/departments?departmentId=${departmentId}&subjectId=${subjectId}`
      : "/departments";

  let footerLabel = "";
  if (departmentName && subjectName) {
    footerLabel = `${departmentName} (${subjectName})`;
  } else {
    footerLabel = departmentName || subjectName;
  }

  return {
    departmentId,
    subjectId,
    departmentName,
    subjectName,
    footerLabel,
    subjectPageHref,
  };
}

async function buildActivitySubPointMaps(subjectId = null) {
  const subPointToSubject = new Map();
  const subPointIds = [];

  const query = subjectId
    ? {
        ...buildSubjectSubPointFilter(subjectId),
        "SubDepartmentsData.data.hasActivities": true,
      }
    : { "SubDepartmentsData.data.hasActivities": true };

  const subPointEntries = await SubDepartments.find(query)
    .select("_id SubDepartmentsData.data.SubdepatmentId")
    .lean();

  for (const entry of subPointEntries) {
    const subPointId = normalizeMongoId(entry._id);
    const mappedSubjectId = normalizeMongoId(entry?.SubDepartmentsData?.data?.SubdepatmentId);
    if (!subPointId || !mappedSubjectId) continue;
    subPointIds.push(subPointId);
    subPointToSubject.set(subPointId, mappedSubjectId);
  }

  return { subPointIds, subPointToSubject };
}

async function enrichActivitiesWithHierarchy(activities, subPointToSubject) {
  if (!activities.length) return [];

  const subjectIds = [
    ...new Set(
      activities
        .map((activity) => subPointToSubject.get(normalizeMongoId(activity.subDepartmentId)))
        .filter(Boolean)
    ),
  ];

  const subjectEntries = subjectIds.length
    ? await InnerDepartments.find({
        _id: { $in: buildIdVariants(subjectIds) },
      }).lean()
    : [];

  const subjectMap = new Map();
  const departmentIds = new Set();

  for (const entry of subjectEntries) {
    const data = entry?.InnerDepartmentsData?.data || {};
    const mappedSubjectId = normalizeMongoId(entry._id);
    const departmentId = normalizeMongoId(data.depatmentId);
    subjectMap.set(mappedSubjectId, {
      title: data.title?.trim() || "",
      departmentId,
    });
    if (departmentId) departmentIds.add(departmentId);
  }

  const departmentEntries = departmentIds.size
    ? await Departments.find({
        _id: { $in: buildIdVariants([...departmentIds]) },
      }).lean()
    : [];

  const departmentMap = new Map();
  for (const entry of departmentEntries) {
    const title = entry?.DepartmentsData?.data?.title?.trim() || "";
    departmentMap.set(normalizeMongoId(entry._id), title);
  }

  return activities.map((activity) => {
    const subPointId = normalizeMongoId(activity.subDepartmentId);
    const mappedSubjectId = subPointToSubject.get(subPointId) || "";
    const subject = subjectMap.get(mappedSubjectId) || { title: "", departmentId: "" };
    const departmentName = departmentMap.get(subject.departmentId) || "";
    const subjectName = subject.title || "";

    let footerLabel = "";
    if (departmentName && subjectName) {
      footerLabel = `${departmentName} (${subjectName})`;
    } else {
      footerLabel = departmentName || subjectName;
    }

    const subjectPageHref =
      subject.departmentId && mappedSubjectId
        ? `/departments?departmentId=${subject.departmentId}&subjectId=${mappedSubjectId}`
        : "/departments";

    return {
      ...activity,
      departmentId: subject.departmentId,
      subjectId: mappedSubjectId,
      departmentName,
      subjectName,
      footerLabel,
      href: subjectPageHref,
      subjectPageHref,
    };
  });
}

export async function fetchPublicDepartmentalActivitiesPage({
  filter = ACTIVITY_FILTER_ALL,
  page = 1,
  limit = DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE,
  subjectId = null,
} = {}) {
  const { subPointIds, subPointToSubject } = await buildActivitySubPointMaps(subjectId);

  if (!subPointIds.length) {
    return { data: [], page, limit, total: 0, hasMore: false };
  }

  const allowedSubPointIds = new Set(subPointIds);

  const activityEntries = await DepartmentlActivity.find({
    "DepartmentlActivityData.data.subDepartmentId": {
      $in: buildIdVariants(subPointIds),
    },
  }).lean();

  let activities = activityEntries
    .map(mapDepartmentalActivity)
    .filter((item) => allowedSubPointIds.has(normalizeMongoId(item.subDepartmentId)))
    .filter((item) => isActiveDepartmentalActivityStatus(item.status));

  activities = filterDepartmentalActivities(activities, filter);
  activities = sortActivitiesByFromDate(activities, "asc");

  const total = activities.length;
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE);
  const start = (safePage - 1) * safeLimit;
  const pageItems = activities.slice(start, start + safeLimit);
  const enriched = await enrichActivitiesWithHierarchy(pageItems, subPointToSubject);

  return {
    data: enriched,
    page: safePage,
    limit: safeLimit,
    total,
    hasMore: start + pageItems.length < total,
  };
}

export async function fetchPublicDepartmentalActivityById(activityId) {
  const id = normalizeMongoId(activityId);
  if (!id) return null;

  const entry = await DepartmentlActivity.findOne({
    _id: { $in: buildIdVariants([id]) },
  }).lean();

  if (!entry) return null;

  const activity = mapDepartmentalActivity(entry);
  if (!isActiveDepartmentalActivityStatus(activity.status)) {
    return null;
  }

  const hierarchy = await resolveActivityHierarchy(activity.subDepartmentId);
  if (!hierarchy) return null;

  return {
    ...activity,
    ...hierarchy,
  };
}
