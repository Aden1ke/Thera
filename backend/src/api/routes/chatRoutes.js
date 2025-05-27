import express from 'express'; 
import chatController from '../controllers/chatController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const chatRouter = express.Router();

chatRouter.post('', authMiddleware.verifyToken, chatController.chatWithUser);

export default chatRouter;