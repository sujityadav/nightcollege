export const parseMasterYear = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1900 || num > 2100) return null;
  return num;
};

export const validateMasterYearRange = (fromYear, toYear) => {
  if (fromYear === null || toYear === null) {
    return 'From year and to year are required';
  }
  if (fromYear >= toYear) {
    return 'From year must be less than to year';
  }
  return null;
};

export async function findDuplicateMasterYear(MasterYear, fromYear, toYear, excludeId = null) {
  const query = { fromYear, toYear };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return MasterYear.findOne(query);
}
