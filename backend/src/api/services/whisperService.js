import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export const createTranscription = async (inputFilePath) => {
  // Convert webm or any audio to wav first
  console.log('🎧 Input file path:', inputFilePath);
  const wavFilePath = inputFilePath.replace(path.extname(inputFilePath), '.wav');

  // Convert input file to wav using ffmpeg
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-y', '-i', inputFilePath, wavFilePath]);

    ffmpeg.stderr.on('data', data => {
      // Optionally log ffmpeg progress:
      console.log(data.toString());
    });

    ffmpeg.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg conversion failed with code ${code}`));
    });
  });

  // Run whisper-cli on wav file
  return new Promise((resolve, reject) => {
    const whisperExecutable = path.resolve('/data/data/com.termux/files/home/Thera/backend/whisper.cpp/build/bin/whisper-cli');

    const args = [
      '--model',
      '/data/data/com.termux/files/home/Thera/backend/whisper.cpp/models/ggml-base.en.bin',
      wavFilePath
    ];

    const whisperProcess = spawn(whisperExecutable, args);

    let transcription = '';
    let errorOutput = '';

    whisperProcess.stdout.on('data', data => {
      console.log('🗣 Whisper STDOUT:', data.toString()); // Debug log for stdout
      transcription += data.toString();
    });

    whisperProcess.stderr.on('data', data => {
      console.error('❗ Whisper STDERR:', data.toString()); // Debug log for stderr
      errorOutput += data.toString();
    });

    whisperProcess.on('close', async (code) => {
      // Clean up wav file after processing
      try {
        await fs.unlink(wavFilePath);
      } catch (err) {
        console.error('Error deleting wav file:', err);
      }

      if (code === 0) {
        resolve(transcription.trim());
      } else {
        reject(new Error(`whisper-cli exited with code ${code}: ${errorOutput}`));
      }
    });
  });
};

