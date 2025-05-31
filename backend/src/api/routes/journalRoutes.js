import express from 'express'; 
import chatController from '../controllers/chatController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import JournalController from '../controllers/journalController.js';

const journalRouter = express.Router();

journalRouter.get('/test', (req, res) => {
  res.send({ message: "Journals route is reachable" });
});
journalRouter.get('/', authMiddleware.verifyToken, JournalController.getJournalsByUser);
journalRouter.get('/emotion-log', authMiddleware.verifyToken, JournalController.getEmotionLog);
journalRouter.get('/:id', authMiddleware.verifyToken, JournalController.getJournalById);


export default journalRouter;