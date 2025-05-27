import { Client } from "@gradio/client";
import JournalEntryModel from '../models/journalEntry.js';
import DistressLogModel from '../models/distressLog.js';
import APIResponse from "../utils/APIResponse.js";

class JournalController {
  constructor() {
    this.gradioClientPromise = Client.connect("SHIROI-07/emotion-detector");
  }

  async analyzeText(text) {
    try {
      const client = await this.gradioClientPromise;
      const result = await client.predict("/predict", { text });
      const { emotions, distress_score } = result.data || {};
      return { emotions, distressScore: distress_score };
    } catch (error) {
      console.error('Failed to analyze text with Gradio API:', error.message);
      throw new Error('Emotion analysis failed');
    }
  }

  async createJournalEntry(req, res) {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || !userId) {
      return res.status(400).json({ message: 'Text and userId required.' });
    }

    try {
      // Step 1: Analyze emotion
      const { emotions, distressScore } = await this.analyzeText(text);

      // Step 2: Save Journal
      const journal = await JournalEntryModel.create({
        userId,
        text,
        emotions,
        distressScore
      });

      // Step 3: Log distress
      await DistressLogModel.createLog({
        userId,
        detectedEmotion: emotions?.join(', ') || 'unknown',
        level: distressScore,
        journalRef: journal._id
      });

      return res.status(201).json({ journal });
    } catch (err) {
      console.error('Journal creation failed:', err.message);
      return APIResponse.error({ res, message: 'Internal server error.' });
    }
  }

  async getEmotionLog(req, res) {
    const userId = req.userId;
    const { from, to, emotion } = req.query;
    const query = { userId };
    if (from || to) query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
    if (emotion) query.detectedEmotion = { $regex: emotion, $options: 'i' };

    try {
      const logs = await DistressLogModel.model.find(query).sort({ createdAt: -1 });
      return APIResponse.success({ res, data: logs, message: 'Fetched emotion log successfully.' });
    } catch (err) {
      return APIResponse.error({ res, message: 'Failed to fetch emotion log.' });
    }
  }
  async getJournalsByUser(userId) {
    if (!userId) throw new Error('User ID is required');
    return JournalEntryModel.findByUserId(userId);
  }
}

export default new JournalController();
