// backend/src/routes/segmentRoutes.js
import express from 'express';
import Joi from 'joi';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import * as segmentController from '../controllers/segmentController.js';
import * as aiService from '../services/aiService.js';

const router = express.Router();

const ruleSchema = Joi.object({
  field: Joi.string().required(),
  operator: Joi.string().valid('equals', 'contains', 'greaterThan', 'lessThan').required(),
  value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.object(), Joi.array()).required()
});

const createSegmentSchema = Joi.object({
  name: Joi.string().required(),
  rules: Joi.array().items(ruleSchema).min(1)
});

const evaluateSchema = Joi.object({
  rules: Joi.array().items(ruleSchema).min(1)
});

const nlToRulesSchema = Joi.object({
  text: Joi.string().required()
});

router.post('/', validationMiddleware([createSegmentSchema]), segmentController.createSegment);
router.get('/:id', segmentController.getSegmentById);
router.get('/', segmentController.getAllSegments);
router.post('/evaluate', validationMiddleware([evaluateSchema]), segmentController.evaluateSegmentRules);
router.post('/ai-rules', segmentController.buildRulesWithAI);

export default router;
