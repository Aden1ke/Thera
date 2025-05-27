import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTranscription = async (inputFilePath) => {
  const wavFilePath = inputFilePath.replace(path.extname(inputFilePath), '.wav');

  // Step 1: Convert input to wav using ffmpeg
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-y', '-i', inputFilePath, wavFilePath]);

    ffmpeg.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg conversion failed with code ${code}`));
    });

    ffmpeg.on('error', err => {
      reject(new Error(`Failed to start ffmpeg: ${err.message}`));
    });
  });

  // Step 2: Run whisper-cli
  return new Promise((resolve, reject) => {
    const whisperExecutable = path.resolve(__dirname, '../../../whisper.cpp/build/bin/whisper-cli');
    const modelPath = path.resolve(__dirname, '../../../whisper.cpp/models/ggml-base.en.bin');

    const args = ['--model', modelPath, wavFilePath];
    const whisperProcess = spawn(whisperExecutable, args);

    let transcription = '';
    let errorOutput = '';

    whisperProcess.stdout.on('data', data => {
      transcription += data.toString();
    });

    whisperProcess.stderr.on('data', data => {
      errorOutput += data.toString();
    });

    whisperProcess.on('close', async (code) => {
      try {
        await fs.unlink(wavFilePath);
      } catch (err) {
        console.error('Failed to delete temp wav file:', err.message);
      }

      if (code === 0) {
        resolve(transcription.trim());
      } else {
        reject(new Error(`whisper-cli exited with code ${code}: ${errorOutput}`));
      }
    });

    whisperProcess.on('error', err => {
      reject(new Error(`Failed to start whisper-cli: ${err.message}`));
    });
  });
};

