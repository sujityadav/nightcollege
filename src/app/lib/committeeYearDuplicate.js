import mongoose from 'mongoose';
import Commities from '../models/commities';
import { normalizeMasterYearId } from './committeeData';

export async function findCommitteeDuplicateYear(masterYearId, excludeId = null) {
  const yearId = normalizeMasterYearId(masterYearId);
  if (!yearId) return null;

  const yearValues = [yearId];
  if (mongoose.Types.ObjectId.isValid(yearId)) {
    yearValues.push(new mongoose.Types.ObjectId(yearId));
  }

  const filter = {
    'CommitiesData.data.masterYearId': { $in: yearValues },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Commities.findOne(filter).lean();
}
