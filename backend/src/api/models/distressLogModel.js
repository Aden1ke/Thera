import mongoose from "mongoose";
import BaseModel from "./baseModel.js";

const distressLogSchemaDefinition = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  detectedEmotion: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  journalRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  userThreshold: {
    type: Number,
    default: 7,
    min: 1,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
};

class DistressLogModel extends BaseModel {
  constructor() {
    super('DistressLog', distressLogSchemaDefinition);
    this.DEFAULT_THRESHOLD = 7;
  }

  async createLog({ userId, detectedEmotion, level, journalRef = null, userThreshold = this.DEFAULT_THRESHOLD }) {
    try {
      const distress = await this.create({
        userId,
        detectedEmotion,
        level,
        journalRef,
        userThreshold
      });
      await this.checkThreshold(distress);
      return distress;
    } catch (error) {
      console.error('Error creating distress log:', error);
      throw new Error('Failed to create distress log');
    }
  }

  async checkThreshold(log) {
    const { userId, level, detectedEmotion, userThreshold } = log;
    const threshold = userThreshold || this.DEFAULT_THRESHOLD;

    if (level >= threshold) {
      console.warn(`⚠️ DISTRESS ALERT — User ${userId}: ${detectedEmotion} at ${level} (threshold: ${threshold})`);
      // Future: emit event / store alert
      return true;
    }

    return false;
  }

  async findAll() {
    return this.model.find().populate('userId').populate('journalRef');
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid distress log ID');
    }
    return this.model.findById(id).populate('userId').populate('journalRef');
  }
}

export default DistressLogModel;