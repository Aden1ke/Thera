import { Client } from "@gradio/client";
import JournalEntryModel from "../models/journal.js";
import DistressLogModel from "../models/distressLogModel.js";

class JournalService {
  constructor() {
    this.gradioClientPromise = Client.connect("SHIROI-07/emotion-detector");
    this.journalEntryModel = new JournalEntryModel();
    this.distressLogModel = new DistressLogModel();
  }

  async analyzeText(text) {
    try {
        const client = await this.gradioClientPromise;
        const result = await client.predict("/predict", { text });

        const first = Array.isArray(result.data) ? result.data[0] : result.data;
        const rawEmotions = first?.emotions || {};
        const emotions = Object.keys(rawEmotions);
        const distressScore = first?.distress_score ?? 0;

        return { emotions, distressScore };
    } catch (error) {
        console.error('Gradio analysis failed:', error.message);
        throw new Error('Emotion analysis failed');
    }
}

  async createJournal({ userId, text }) {
    if (!userId || !text) {
      throw new Error("User ID and text are required to create a journal.");
    }

    let emotions, distressScore, journal;

    try {
        const result = await this.analyzeText(text);
        ({ emotions, distressScore } = result);
    } catch (error) {
        console.error('Error analyzing text:', error.message);
        throw new Error('Failed to analyze text for emotions');
    }

    console.log(text, emotions, distressScore);

    try {
        journal = await this.journalEntryModel.createEntry({
            userId,
            entry: text,
            emotions,
            distressScore
        });

        await this.distressLogModel.createLog({
            userId,
            detectedEmotion: emotions?.join(', ') || 'unknown',
            level: distressScore,
            journalRef: journal._id
        });
    } catch (error) {
        console.error('Error creating journal entry:', error.message);
        throw new Error('Failed to create journal entry');
    }

    return journal;
  }

  async getJournalsByUser(userId) {
    if (!userId) throw new Error("User ID is required.");
    return await this.journalEntryModel.findByUserId(userId);
  }
  
  async getJournalById(journalId, userId) {
    try {
      const journal = await this.journalEntryModel.findOne({ _id: journalId, userId });
      return journal;
    } catch (error) {
      throw error;
    }
  }

  async getEmotionLogs({ userId, from, to, emotion }) {
    const query = { userId };

    if (from || to) query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
    if (emotion) query.detectedEmotion = { $regex: emotion, $options: 'i' };

    return await this.distressLogModel.model.find(query).sort({ createdAt: -1 });
  }
}

export default new JournalService();