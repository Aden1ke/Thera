import mongoose from "mongoose";
import BaseModel from "./baseModel.js";
import { addEntryToVectorStore } from "../utils/vectorStore.js";

const journalSchemaDefinition = {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    entry: { type: String, required: true },
    emotions: { type: [ String ] },
    distressScore: { type: Number },
    createdAt: { type: Date, default: Date.now }
}

class JournalEntryModel extends BaseModel {
    constructor() {
        super('JournalEntry', journalSchemaDefinition);
    }

    async createEntry(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data provided for creating the document');
        }

        let entry;

        try {
            entry = await this.create(data);
        } catch (error) {
            console.error('Error creating document:', error);
            throw new Error('Failed to create document');
        }

        try {
            await addEntryToVectorStore(entry);
        } catch (error) {
            console.error('Error adding seed to vector store:', error);
            throw new Error('Failed to add seed to vector store');
        }

        return entry;
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

export default JournalEntryModel;