import mongoose, { Schema } from 'mongoose';

const DistressLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
    type: Schema.Types.ObjectId,
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
});

class DistressLogModel {
  constructor() {
    this.model = mongoose.model('DistressLog', DistressLogSchema);
    this.DEFAULT_THRESHOLD = 7;
  }

  async createLog({ userId, detectedEmotion, level, journalRef = null, userThreshold = this.DEFAULT_THRESHOLD }) {
    try {
      const distress = new this.model({
        userId,
        detectedEmotion,
        level,
        journalRef,
        userThreshold
      });

      const saved = await distress.save();
      await this.checkThreshold(saved); // trigger check
      return saved;
    } catch (error) {
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

export default new DistressLogModel();
// This model handles distress logs, including creation and threshold checks.
// It can also retrieve logs by user or ID.