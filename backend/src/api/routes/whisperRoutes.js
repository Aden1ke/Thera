import express from 'express';
import upload from '../middlewares/upload.js'; // updated multer import
import { transcribeAudio } from '../controllers/whisperController.js';

const router = express.Router();

router.post('/transcribe', upload.single('file'), transcribeAudio);

export default router;

