import express from 'express'; 
import AuthContoller from '../controllers/authController.js'; 
import authMiddleware from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', AuthContoller.register);
authRouter.post('/login', AuthContoller.login);
authRouter.get('/profile', authMiddleware.verifyToken, AuthContoller.getUser);
authRouter.put('/profile', authMiddleware.verifyToken, AuthContoller.updateUser);

export default authRouter;