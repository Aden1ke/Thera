import { Client } from "@gradio/client";
import JournalEntryModel from "../models/journalEntry.js";
import DistressLogModel from "../models/distressLog.js";

class JournalService {
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
      console.error('Gradio analysis failed:', error.message);
      throw new Error('Emotion analysis failed');
    }
  }

  async createJournal({ userId, text }) {
    if (!userId || !text) {
      throw new Error("User ID and text are required to create a journal.");
    }

    const { emotions, distressScore } = await this.analyzeText(text);

    const journal = await JournalEntryModel.create({
      userId,
      text,
      emotions,
      distressScore
    });

    await DistressLogModel.createLog({
      userId,
      detectedEmotion: emotions?.join(', ') || 'unknown',
      level: distressScore,
      journalRef: journal._id
    });
     await HealingMemoryService.processAndSaveMemory({
            userId,
            journalRef: journal._id,
            text
            });
    return journal;
  }

  async getJournalsByUser(userId) {
    if (!userId) throw new Error("User ID is required.");
    return await JournalEntryModel.findByUserId(userId);
  }

  async getEmotionLogs({ userId, from, to, emotion }) {
    const query = { userId };

    if (from || to) query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
    if (emotion) query.detectedEmotion = { $regex: emotion, $options: 'i' };

    return await DistressLogModel.model.find(query).sort({ createdAt: -1 });
  }
}

export default new JournalService();
