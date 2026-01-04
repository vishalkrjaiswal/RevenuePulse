// backend/src/services/communicationLogService.js
import mongoose from 'mongoose';
import CommunicationLog from '../models/CommunicationLog.js';

export const createLog = async (data) => {
  const log = new CommunicationLog({
    campaignId: data.campaignId,
    customerId: data.customerId,
    message: data.message,   // 👈 add message
    status: data.status,
    sentAt: data.sentAt,
    response: data.response
  });
  await log.save();
  return log;
};

export const updateLog = async ({ logId, campaignId, customerId, status, response }) => {
  const filter = logId ? { _id: logId } : { campaignId, customerId };
  const update = { status, response, sentAt: new Date() };
  return CommunicationLog.findOneAndUpdate(filter, update, { new: true });
};

export const queryLogs = async ({ campaignId, customerId, status, from, to }) => {
  const filter = {};
  if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) filter.campaignId = campaignId;
  if (customerId && mongoose.Types.ObjectId.isValid(customerId)) filter.customerId = customerId;
  if (status) filter.status = status;
  if (from || to) {
    filter.sentAt = {};
    if (from) filter.sentAt.$gte = new Date(from);
    if (to) filter.sentAt.$lte = new Date(to);
  }
  return CommunicationLog.find(filter)
    .populate('customerId', 'name email')
    .populate('campaignId', 'name')
    .sort({ sentAt: -1 })
    .lean();
};
