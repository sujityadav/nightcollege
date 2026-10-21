export function getDepartmentalActivityDetailPath(activityId) {
  if (!activityId) return '#';
  return `/departmental-activities/${activityId}`;
}
