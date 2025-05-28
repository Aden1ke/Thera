import express from 'express';
import JournalController from '../controllers/journalController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import APIResponse from '../utils/APIResponse.js';

const journalRouter = express.Router();

// Apply auth middleware globally to all journal routes
journalRouter.use(authMiddleware.handle.bind(authMiddleware));

// POST /journal-entry - Create a new journal entry
journalRouter.post('/journal-entry', (req, res) => 
  JournalController.createJournalEntry(req, res)
);

// GET / - Get all journal entries for authenticated user
journalRouter.get('/', (req, res) => 
  JournalController.getJournalsByUser(req, res)
);

// GET /:id - Get a specific journal entry by ID
journalRouter.get('/:id', (req, res) => 
  JournalController.getJournalById(req, res)
);

// GET /emotion-log - Get emotion logs for user
journalRouter.get('/emotion-log', (req, res) =>
  JournalController.getEmotionLog(req, res)
);

export default journalRouter;
