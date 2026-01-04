// backend/src/services/campaignService.js
import mongoose from "mongoose";
import Campaign from '../models/Campaign.js';
import Segment from '../models/Segment.js';
import * as communicationLogService from './communicationLogService.js';
import * as segmentationService from './segmentationService.js';
import * as vendorService from './vendorService.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * createCampaign: stores campaign metadata
 */

export const createCampaign = async (data) => {
  // Validate segmentId format
  if (!mongoose.Types.ObjectId.isValid(data.segmentId)) {
    throw new Error("Invalid segmentId");
  }

  const campaign = new Campaign({
    name: data.name,
    segmentId: data.segmentId,
    message: data.message,
    scheduledAt: data.scheduledAt || Date.now(),
    createdBy: data.createdBy
  });

  try {
    await campaign.save();
    return campaign;
  } catch (err) {
    console.error("Error saving campaign:", err);
    throw new Error("Database error while creating campaign");
  }
};

export const getCampaignById = async (id) => {
  return Campaign.findById(id)
    .populate('segmentId', 'name rules')
    .lean();
};

export const getAllCampaigns = async () => {
  return Campaign.find().lean();
};

/**
 * sendCampaign: send messages to each customer with personalized greeting
 */
export const sendCampaign = async (campaignId, user) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  const segment = campaign.segmentId 
    ? await Segment.findById(campaign.segmentId) 
    : null;

  const { customers } = segment
    ? await segmentationService.evaluateRules(segment.rules)
    : await segmentationService.evaluateRules([]); // all customers if no segment

  campaign.status = 'running';
  await campaign.save();

  let sent = 0;
  let failed = 0;

  for (const cust of customers) {
    try {
      // --- personalize the message ---
      let personalized = campaign.message || '';
      if (cust.name) {
        if (!personalized.toLowerCase().startsWith(`hey ${cust.name.toLowerCase()}`)) {
          personalized = `Hey ${cust.name}, ${personalized}`;
        }
      }

      // --- send the message ---
      const response = await vendorService.sendMessage({ to: cust, message: personalized });
      const status = response.success ? 'sent' : 'failed';
      
      if (response.success) sent++;
      else failed++;

      // --- log communication ---
      await communicationLogService.createLog({
        campaignId: campaign._id,
        customerId: cust._id,
        message: personalized,  // store personalized message
        status,
        sentAt: new Date(),
        response: response.message || ''
      });

    } catch (err) {
      failed++;

      await communicationLogService.createLog({
        campaignId: campaign._id,
        customerId: cust._id,
        message: campaign.message, // fallback if personalization failed
        status: 'failed',
        sentAt: new Date(),
        response: err.message
      });
    }
  }

  campaign.status = 'completed';
  campaign.sentAt = new Date();
  await campaign.save();

  return { total: customers.length, sent, failed };
};

/**
 * AI based Campaign messages suggestions
 */
export const suggestCampaignMessages = async ({ product, audience, tone }) => {
  const prompt = `Generate 3 creative and engaging campaign messages for promoting ${product} 
  to ${audience}. Tone: ${tone}. Keep each message under 200 characters. Don't number them, just write the messages.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.choices[0].message.content;
  return text.split("\n").filter(line => line.trim());
};
 