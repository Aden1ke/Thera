import mongoose from "mongoose";
import BaseModel from "./baseModel.js";
import { addEntryToVectorStore } from "../utils/vectorStore.js";

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
}

export default JournalEntryModel;