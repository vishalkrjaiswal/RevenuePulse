// backend/src/routes/communicationLogRoutes.js
import express from 'express';
import * as communicationLogController from '../controllers/communicationLogController.js';

const router = express.Router();

// Optional query params: campaignId, customerId, status, from, to
router.get('/', communicationLogController.listCommunicationLogs);

// Vendor delivery receipt callback (public endpoint — vendor will call it)
router.post('/receipt', communicationLogController.handleDeliveryReceipt);

export default router;
