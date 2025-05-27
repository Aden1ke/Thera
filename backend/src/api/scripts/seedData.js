import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SeedModel from '../models/seedModel.js';

dotenv.config();
const seedModel = new SeedModel();

const seeds = [
    {
        emotionTags: ['anxious', 'nervous'],
        distressLevel: 8,
        prompt: 'Take five deep breaths slowly. Inhale... exhale...',
        visualCue: 'https://example.com/breathing-circle.gif',
    },
    {
        emotionTags: ['sad', 'down'],
        distressLevel: 6,
        prompt: 'Write down 3 things you’re grateful for right now.',
        visualCue: '',
    },
    // i should add more seeds here
    {
        emotionTags: ['angry', 'frustrated'],
        distressLevel: 7,
        prompt: 'Go for a 10-minute walk outside to clear your mind.',
        visualCue: 'https://example.com/walk-outside.gif',
    },
    {
        emotionTags: ['stressed', 'overwhelmed'],
        distressLevel: 9,
        prompt: 'Try progressive muscle relaxation. Tense and relax each muscle group.',
        visualCue: '',
    },
    {
        emotionTags: ['lonely', 'isolated'],
        distressLevel: 5,
        prompt: 'Call or text a friend or family member to talk.',
        visualCue: '',
    },
];

async function run() {
  try {
    await mongoose.connect(process.env.DEV_DB_URI);
    const seedModel = new SeedModel();

    // Insert each seed using createSeed
    for (const seed of seeds) {
      await seedModel.createSeed(seed);
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();