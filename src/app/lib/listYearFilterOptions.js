export const LIST_YEAR_FILTER_START = 2020;

export function getListYearFilterEndYear(date = new Date()) {
  return date.getFullYear() + 2;
}

/** @returns {{ label: string, value: string }[]} */
export function getListYearFilterOptions(date = new Date()) {
  const end = getListYearFilterEndYear(date);
  const options = [{ label: 'All Years', value: '' }];
  for (let year = LIST_YEAR_FILTER_START; year <= end; year += 1) {
    options.push({ label: String(year), value: String(year) });
  }
  return options;
}

/**
 * Year filter for fromDate fields stored as BSON Date or ISO date strings (Mixed schemas).
 * @param {string} fieldPath Mongo field path without leading `$`
 */
export function getFromDateYearFilter(fieldPath, yearParam) {
  const year = Number.parseInt(String(yearParam), 10);
  if (Number.isNaN(year)) return null;
  const fieldRef = fieldPath.startsWith('$') ? fieldPath : `$${fieldPath}`;
  return {
    $expr: {
      $eq: [
        {
          $year: {
            $convert: {
              input: fieldRef,
              to: 'date',
              onError: null,
              onNull: null,
            },
          },
        },
        year,
      ],
    },
  };
}

export function mergeQueriesWithAnd(...queries) {
  const parts = queries.filter((q) => q && Object.keys(q).length > 0);
  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0];
  return { $and: parts };
}
