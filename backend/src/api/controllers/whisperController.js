import fs from 'fs';
import { createTranscription } from '../services/whisperService.js';

export const transcribeAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const result = await createTranscription(filePath);

   
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    return res.json({ text: result });
  } catch (error) {
    fs.unlink(req.file.path, () => {}); 
    return res.status(500).json({
      error: 'Transcription failed',
      details: error.message
    });
  }
};
