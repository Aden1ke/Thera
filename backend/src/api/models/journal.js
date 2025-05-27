import mongoose from "mongoose";
import BaseModel from "./baseModel.js";

const journalSchemaDefinition = {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    entry: { type: String, required: true },
    emotion: { type: [ String ] },
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

        try {
            const entry = await this.create(data);
        } catch (error) {
            console.error('Error creating document:', error);
            throw new Error('Failed to create document');
        }

        return entry;
  }
}

export default JournalEntryModel;