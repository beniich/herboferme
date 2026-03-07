import { Request, Response } from 'express';
import { aiService } from '../services/ai.service.js';
import AIConversation from '../models/AIConversation.js';
import AIPrediction from '../models/AIPrediction.js';

// @desc    Send a message to AI assistant
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    const userId = (req as any).user.id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const conversation = await aiService.generateChatResponse(userId, message, conversationId);

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's AI conversations
// @route   GET /api/ai/conversations
// @access  Private
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversations = await AIConversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('-messages') // Do not load all messages for the list
      .limit(20);

    res.status(200).json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate a prediction 
// @route   POST /api/ai/predict
// @access  Private
export const predict = async (req: Request, res: Response) => {
  try {
    const { type, target, domainId } = req.body;
    // user ID can be verified here

    if (!type || !target || !domainId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type, target, and domainId are required' 
      });
    }

    const prediction = await aiService.generatePrediction(domainId, type, target);

    res.status(201).json({
      success: true,
      data: prediction
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get previous predictions 
// @route   GET /api/ai/predictions
// @access  Private
export const getPredictions = async (req: Request, res: Response) => {
  try {
    const { domainId } = req.query;
    
    const query: any = {};
    if (domainId) query.domainId = domainId;

    const predictions = await AIPrediction.find(query)
      .sort({ generatedAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, data: predictions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
