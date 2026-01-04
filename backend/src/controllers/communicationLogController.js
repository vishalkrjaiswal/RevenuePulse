// backend/src/controllers/communicationLogController.js
import * as communicationLogService from '../services/communicationLogService.js';
import CommunicationLog from '../models/CommunicationLog.js';

export const listCommunicationLogs = async (req, res, next) => {
  try {
    const filters = {
      campaignId: req.query.campaignId,
      customerId: req.query.customerId,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to
    };
    const logs = await communicationLogService.queryLogs(filters);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const handleDeliveryReceipt = async (req, res, next) => {
  try {
    // Vendor posts: { logId, campaignId, customerId, status, response }
    const { logId, campaignId, customerId, status, response } = req.body;
    if (!logId && (!campaignId || !customerId)) {
      return res.status(400).json({ error: 'Provide logId OR campaignId and customerId' });
    }

    const updated = await communicationLogService.updateLog({
      logId,
      campaignId,
      customerId,
      status,
      response
    });

    if (!updated) return res.status(404).json({ error: 'Log not found' });
    return res.json({ success: true, log: updated });
  } catch (err) {
    next(err);
  }
};
