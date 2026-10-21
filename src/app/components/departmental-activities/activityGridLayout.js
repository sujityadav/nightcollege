/** Grid: max 2 per row; a single card uses one column (not full width). */
export function getDepartmentalActivitiesGridClass() {
  return 'grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8';
}

/** Homepage: 4 activities in one row on large screens. */
export function getHomeDepartmentalActivitiesGridClass() {
  return 'grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5 3xl:gap-6';
}
