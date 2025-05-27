import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './api/routes/authRoutes.js';
import { createEntryVectorStore, createVectorStoreFromSeeds } from './api/utils/vectorStore.js';
import SeedModel from './api/models/seedModel.js';

import dbClient from './config/db.js';
import chatRouter from './api/routes/chatRoutes.js';

dotenv.config();
const app = express();

// Middleware configurations
app.use(helmet());
app.use(cors()); 
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Basic check endpoint
app.get('/check_connection', (req, res) => {
    if (dbClient.isAlive()) {
        return res.status(200).json({ status: 'OK', db: 'connected' });
    }
    return res.status(500).json({ status: 'Error', db: 'disconnected' });
});

// Import routes
// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRouter)
// 404 error handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// error handler middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// Start server only after DB connection is ready
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await dbClient.connect();
        try {
            const seedModel = new SeedModel();
            const allSeedsDocs = await seedModel.findAll();
            const allSeeds = allSeedsDocs.map(doc => doc.toObject ? doc.toObject() : doc);
            await createVectorStoreFromSeeds(allSeeds);
            await createEntryVectorStore();
            console.log('All seed embedded')
        } catch (err) {
            console.log(err);
        }
        
        app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
