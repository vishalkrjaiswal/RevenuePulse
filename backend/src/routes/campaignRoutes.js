// backend/src/routes/campaignRoutes.js
import express from "express";
import Joi from "joi";
import validationMiddleware from "../middlewares/validationMiddleware.js";
import * as campaignController from "../controllers/campaignController.js";
import { verifyJwt } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Schema for creating campaign
const createCampaignSchema = Joi.object({
  name: Joi.string().required(),
  segmentId: Joi.string().optional(),
  message: Joi.string().required(),
  scheduledAt: Joi.date().optional(),
});

// Create a campaign (protected + validated)
router.post(
  "/",
  verifyJwt, // require login// require admin role
  validationMiddleware(createCampaignSchema),
  campaignController.createCampaign
);

// Get campaign by id
router.get("/:id", verifyJwt, campaignController.getCampaignById);

// Get all campaigns
router.get("/", verifyJwt, campaignController.getAllCampaigns);

// Send campaign
//router.post('/:id/send', verifyJwt, campaignController.sendCampaign);

// AI suggestions (decide if you want auth or not)
router.post(
  "/ai-suggestions",
  verifyJwt,
  validationMiddleware(createCampaignSchema),
  campaignController.suggestCampaignMessages
);

router.post(
  "/create-and-send",
  verifyJwt,
  campaignController.createAndSendCampaign
);

export default router;
