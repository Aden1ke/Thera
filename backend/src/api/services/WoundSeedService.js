import HealingMemoryLog from "../models/healingMemoryLog.js";
import dayjs from "dayjs";

class WoundSeedService {
  constructor() {
    this.model = HealingMemoryLog;
  }

  async getEmotionalPatterns(userId) {
    const logs = await this.model.find({ userId });
    if (!logs.length) return [];

    const emotionMap = {};

    for (const log of logs) {
      const emotions = log.memorySummary.match(/\b(sad|angry|fear|shame|lonely|guilt|hurt|worthless)\b/gi) || [];

      for (const emotion of emotions) {
        const e = emotion.toLowerCase();
        if (!emotionMap[e]) {
          emotionMap[e] = { count: 1, firstSeen: log.createdAt, lastSeen: log.createdAt };
        } else {
          emotionMap[e].count++;
          emotionMap[e].lastSeen = log.createdAt;
        }
      }
    }

    // Flag recurring emotions as Wound Seeds
    const woundSeeds = [];
    for (const [emotion, meta] of Object.entries(emotionMap)) {
      if (meta.count >= 3) {
        woundSeeds.push({
          emotion,
          occurrences: meta.count,
          firstSeen: dayjs(meta.firstSeen).format("YYYY-MM-DD"),
          lastSeen: dayjs(meta.lastSeen).format("YYYY-MM-DD"),
        });
      }
    }

    return woundSeeds;
  }
}

export default new WoundSeedService();
