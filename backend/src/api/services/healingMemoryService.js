import HealingMemoryLog from '../models/healingMemoryLog.js';
import { createEmbedding } from '../utils/embeddingHelper.js';

class HealingMemoryService {
  async processAndSaveMemory({ userId, journalRef, text }) {
    if (!text || !userId || !journalRef) {
      throw new Error("Missing required fields for memory processing.");
    }

    const summary = await this.generateSummary(text); // You can improve this later
    const embedding = await createEmbedding(summary);

    return await HealingMemoryLog.create({
      userId,
      journalRef,
      memorySummary: summary,
      embedding
    });
  }

  // Placeholder summary generator (replace with GPT later)
  async generateSummary(text) {
    return `Summary: ${text.slice(0, 150)}...`; // crude summary
  }
}

export default new HealingMemoryService();
