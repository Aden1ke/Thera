import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import JournalController from '../controllers/journalController.js';
import APIResponse from '../utils/APIResponse.js';
import UserController from '../controllers/userController.js';
import { getAllUsers } from '../controllers/userController.js';
const userRouter = express.Router();

// Use the .handle method of the instance, and bind it to preserve 'this'
userRouter.use(authMiddleware.handle.bind(authMiddleware));

// authenticated user routes
userRouter.get('/', getAllUsers);
userRouter.get('/:id', UserController.getUserById.bind(UserController));
userRouter.post('/', UserController.createUser.bind(UserController));
userRouter.put('/:id', UserController.updateUser.bind(UserController));
userRouter.delete('/:id', UserController.deleteUser.bind(UserController));

// Get all emotion logs for the authenticated user (with optional filters)
userRouter.get('/emotion-log', (req, res) => JournalController.getEmotionLog(req, res));

// Create a new journal entry (analyzes emotion, logs distress)
userRouter.post('/journal-entry', (req, res) => JournalController.createJournalEntry(req, res));

// Get all journal entries for the authenticated user
userRouter.get('/journal-entries', async (req, res) => {
  try {
    const entries = await JournalController.getJournalsByUser(req.userId);
    return APIResponse.success({ res, data: { entries } });
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    return APIResponse.error({ res, message: 'Failed to fetch journal entries.' });
  }
});

// Get a specific journal entry by ID
userRouter.get('/journal-entry/:id', async (req, res) => {
  try {
    const entry = await JournalController.getJournalById(req.params.id, req.userId);
    if (!entry) {
      return APIResponse.notFound({ res, message: 'Journal entry not found' });
    }
    return APIResponse.success({ res, data: { entry } });
  } catch (err) {
    console.error('Error fetching journal entry:', err);
    return APIResponse.error({ res, message: 'Failed to fetch journal entry.' });
  }
});

export default userRouter;