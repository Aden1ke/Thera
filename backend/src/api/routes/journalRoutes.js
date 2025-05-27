import express from 'express';
import JournalController from '../controllers/journalController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; 
import APIResponse from '../utils/APIResponse.js';

const journalRouter = express.Router();

// Use the .handle method of the instance, and bind it to preserve 'this'
journalRouter.use(authMiddleware.handle.bind(authMiddleware));

// POST /journal - Create a new journal entry
journalRouter.post('/journal-entry', (req, res) => JournalController.createJournalEntry(req, res));

// GET /journal - Get all entries for authenticated user
journalRouter.get('/', async (req, res) => {
  try {
    const entries = await JournalController.getJournalsByUser(req.userId);
    return APIResponse.success(res, entries, 'Fetched journal entries successfully');
  } catch (err) {
    console.error('Error in GET /journal:', err);
    return APIResponse.error(res, err.message || 'Failed to fetch journal entries', 500);
  }
});

// GET /journal/:id - Get a specific journal entry by ID
journalRouter.get('/:id', async (req, res) => {
  try {
    const entry = await JournalController.getJournalById(req.params.id, req.userId);
    if (!entry) {
      return APIResponse.notFound(res, 'Journal entry not found');
    }
    return APIResponse.success(res, entry, 'Fetched journal entry successfully');
  } catch (err) {
    console.error('Error in GET /journal/:id:', err);
    return APIResponse.error(res, err.message || 'Failed to fetch journal entry', 500);
  }
});

// GET /journal/emotion-log - Get emotion log for authenticated user
journalRouter.get('/emotion-log', (req, res) => JournalController.getEmotionLog(req, res));

export default journalRouter;