import { addSeedToVectorStore } from '../utils/vectorStore.js';
import BaseModel from './baseModel.js';

const seedSchemaDefinition = {
    emotionTags: {
        type: [String],
        required: true,
        default: [],
    },
    distressLevel: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
    },
    prompt: {
        type: String,
        required: true,
        trim: true,
    },
    visualCue: {
        type: String,
        trim: true,
        default: '',
    },
};

class SeedModel extends BaseModel {
    constructor() {
        super('seed', seedSchemaDefinition);
    }

    async getByEmotionAndDistress(emotion, distressLevel) {
        return await this.model.find({
        emotionTags: { $in: [emotion] },
        distressLevel,
        });
    }

    async createSeed(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data provided for creating the document');
        }

        let seed;

        try {
            seed = await this.create(data);
        } catch (error) {
            console.error('Error creating document:', error);
            throw new Error('Failed to create document');
        }

        try {
            await addSeedToVectorStore(seed);
        } catch (error) {
            console.error('Error adding seed to vector store:', error);
            throw new Error('Failed to add seed to vector store');
        }

        return seed
  }
}

export default SeedModel;