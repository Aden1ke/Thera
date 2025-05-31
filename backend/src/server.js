// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Database Client
import dbClient from './config/db.js';

// Routes
import authRoutes from './api/routes/authRoutes.js';
import chatRouter from './api/routes/chatRoutes.js';
import journalRouter from './api/routes/journalRoutes.js';
import youTubeRouter from './api/routes/youTubeRoutes.js';
//import robertaRoutes from './api/routes/robertaRoutes.js';
import userRoutes from './api/routes/userRoutes.js'; // Keep this line as intended

// Utils & Services
import { createEntryVectorStore, createVectorStoreFromSeeds } from './api/utils/vectorStore.js';
import SeedModel from './api/models/seedModel.js';
import { transcribeAudioWithWhisperCpp } from './api/services/whisper.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000; // Define PORT here

// Middleware configurations
app.use(helmet());
// CORS Configuration using environment variablele
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use FRONTEND_URL from .env, with a fallback
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Add PATCH if you use it for updates
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed request headers
  credentials: true, // If you send cookies or authorization headers
  exposedHeaders: ['Authorization'], // <--- IMPORTANT: If you return JWT in Authorization header, expose it!
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Create HTTP server and attach WebSocket Server
const server = createServer(app); // Use 'server' to handle both HTTP and WS
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log('WebSocket: Client connected');

    let whisperModelConfig = { model: "base", sampleRate: 16000 };
    let audioBufferChunks = []; // Accumulate audio data here
    let timeoutId = null; // To manage transcription timeout

    ws.on('message', async message => {
        try {
            const data = JSON.parse(message);
            if (data.type === "config") {
                whisperModelConfig = {
                    model: data.model || "base",
                    sampleRate: data.sampleRate || 16000
                };
                console.log('WebSocket: Received config:', whisperModelConfig);
                ws.send(JSON.stringify({ type: "ack", message: "Config received" }));
            } else {
                console.warn('WebSocket: Received unknown JSON message type:', data.type);
            }
        } catch (e) {
            // This catch block means the message was not JSON, so it's audio data
            audioBufferChunks.push(Buffer.from(message));

            // Reset timeout every time new audio comes in
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // If no new audio for a certain duration, trigger transcription
                console.log("No new audio for 500ms, triggering transcription.");
                triggerTranscription();
            }, 500); // Adjust this silence detection timeout as needed
        }
    });

    // Function to trigger transcription
    const triggerTranscription = async () => {
        clearTimeout(timeoutId); // Ensure timeout is cleared once triggered
        if (audioBufferChunks.length === 0) {
            console.log("No audio chunks to transcribe.");
            return;
        }

        console.log(`server: Processing ${audioBufferChunks.length} audio chunks...`);
        const fullAudioBuffer = Buffer.concat(audioBufferChunks);
        audioBufferChunks = []; // Clear buffer immediately

        try {
            // Call the whisper service to transcribe the audio
            const transcript = await transcribeAudioWithWhisperCpp(fullAudioBuffer, whisperModelConfig);
            console.log('server: Transcription successful:', transcript);
            ws.send(JSON.stringify({ type: "transcript", text: transcript }));
        } catch (error) {
            console.error('server: Transcription failed:', error.message);
            ws.send(JSON.stringify({ type: "error", message: `Transcription error: ${error.message}` }));
        }
    };


    ws.on('close', async () => {
        console.log('WebSocket: Client disconnected.');
        clearTimeout(timeoutId); // Clear any pending transcription timeout
        if (audioBufferChunks.length > 0) {
            console.log("Client disconnected with pending audio, triggering final transcription.");
            await triggerTranscription(); // Process any remaining audio on disconnect
        }
    });

    ws.on('error', error => {
        console.error('WebSocket: Error occurred:', error);
        clearTimeout(timeoutId);
        audioBufferChunks = []; // Clear buffer on error
    });
});


// Basic check endpoint
app.get('/check_connection', (req, res) => {
    // Assuming dbClient has an isAlive method or similar check
    if (dbClient && dbClient.isAlive && dbClient.isAlive()) { // Added check for existence of dbClient and method
        return res.status(200).json({ status: 'OK', db: 'connected' });
    }
    return res.status(500).json({ status: 'Error', db: 'disconnected', message: 'Database client not fully initialized or not connected' });
});

// Use API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRouter);
app.use('/api/journals', journalRouter);
//app.use('/api/roberta', robertaRouter);
app.use('/api/youtube', youTubeRouter);
app.use('/api/users', userRoutes); // Add this line, choose your path
// ...
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


async function startServer() {
    try {
        await dbClient.connect(); // Ensure database connection
        console.log('Database connected successfully.');

        try {
            const seedModel = new SeedModel();
            const allSeedsDocs = await seedModel.findAll();
            const allSeeds = allSeedsDocs.map(doc => doc.toObject ? doc.toObject() : doc);
            await createVectorStoreFromSeeds(allSeeds);
            await createEntryVectorStore();
            console.log('All seeds embedded and entry vector store initialized.');
        } catch (err) {
            console.error('Error during vector store initialization:', err);
            // Decide if this error should stop the server or just log a warning
        }

        // Use server.listen for both HTTP and WebSocket
        server.listen(PORT, () => {
            console.log(`HTTP and WebSocket server running on port ${PORT}`);
            console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1); // Exit process if database connection fails
    }
}

startServer();
