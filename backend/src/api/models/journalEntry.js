// models/JournalEntry.js
import mongoose, { Schema } from 'mongoose';
import BaseModel from './baseModel.js';

const JournalEntrySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  detectedEmotion: {
    type: [String],
    required: true,
  },
  distressLevel: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default class JournalEntryModel extends BaseModel {
  constructor() {
    super(JournalEntrySchema);
  }

  async create(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided for creating the journal entry');
    }

    try {
      const entry = new this.model(data);
      return await entry.save();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw new Error('Failed to create journal entry');
    }
  }

  async findByUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required to find journal entries');
    }

    try {
      return await this.model.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw new Error('Failed to fetch journal entries');
    }
  }

  async findById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID provided to find the journal entry');
    }

    try {
      return await this.model.findById(id);
    } catch (error) {
      console.error('Error fetching journal entry by ID:', error);
      throw new Error('Failed to fetch journal entry by ID');
    }
  }
}