// backend/src/services/whisperService.js
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WHISPER_CPP_DIR = path.join(__dirname, '..', '..', 'whisper.cpp');
const WHISPER_CPP_MAIN_EXECUTABLE = path.join(WHISPER_CPP_DIR, 'main'); // Or 'stream' if you use that
const WHISPER_MODEL_PATH = path.join(WHISPER_CPP_DIR, 'models', 'ggml-base.en.bin'); // Or your chosen model

// Ensure an uploads directory exists for temporary audio files
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Function to create a WAV header (basic for 16-bit PCM, mono)
function createWavHeader(dataLength, sampleRate, numChannels, bitDepth) {
    const headerByteLength = 44;
    const totalLength = dataLength + headerByteLength;
    const buffer = Buffer.alloc(headerByteLength);

    const byteRate = sampleRate * numChannels * (bitDepth / 8);
    const blockAlign = numChannels * (bitDepth / 8);

    let offset = 0;
    // RIFF header
    buffer.write('RIFF', offset); offset += 4;
    buffer.writeUInt32LE(totalLength - 8, offset); offset += 4; // File size - 8
    buffer.write('WAVE', offset); offset += 4;

    // FMT sub-chunk
    buffer.write('fmt ', offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4; // Sub-chunk 1 size (16 for PCM)
    buffer.writeUInt16LE(1, offset); offset += 2; // Audio format (1 for PCM)
    buffer.writeUInt16LE(numChannels, offset); offset += 2; // Number of channels
    buffer.writeUInt32LE(sampleRate, offset); offset += 4; // Sample rate
    buffer.writeUInt32LE(byteRate, offset); offset += 4; // Byte rate
    buffer.writeUInt16LE(blockAlign, offset); offset += 2; // Block align
    buffer.writeUInt16LE(bitDepth, offset); offset += 2; // Bits per sample

    // Data sub-chunk
    buffer.write('data', offset); offset += 4;
    buffer.writeUInt32LE(dataLength, offset); offset += 4; // Data size

    return buffer;
}



async function transcribeAudioWithWhisperCpp(audioBuffer, config) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(WHISPER_CPP_MAIN_EXECUTABLE)) {
            return reject(new Error(`Whisper.cpp executable not found at: ${WHISPER_CPP_MAIN_EXECUTABLE}. Did you build it?`));
        }
        if (!fs.existsSync(WHISPER_MODEL_PATH)) {
            return reject(new Error(`Whisper.cpp model not found at: ${WHISPER_MODEL_PATH}. Did you download it?`));
        }

        const tempAudioFileName = path.join(UPLOADS_DIR, `audio_${Date.now()}.wav`);
        let currentAudioFileName = tempAudioFileName; // For cleanup

        try {
            const sampleRate = config.sampleRate || 16000;
            const numChannels = 1;
            const bitDepth = 16; 

            const wavHeader = createWavHeader(audioBuffer.length, sampleRate, numChannels, bitDepth);
            const finalAudioFileBuffer = Buffer.concat([wavHeader, audioBuffer]);

            fs.writeFileSync(tempAudioFileName, finalAudioFileBuffer);
            console.log(`whisperService: Saved audio to ${tempAudioFileName}`);

            const whisperProcess = spawn(WHISPER_CPP_MAIN_EXECUTABLE, [
                '-m', WHISPER_MODEL_PATH,
                '-f', tempAudioFileName,
                '-l', 'en', // Language (adjust as needed)
                '-ojf', // Output JSON format
                '-p', '0', // Number of threads (0 for auto, or specify for performance)
                '-t', '4' // Number of threads for CPU
            ]);

            let fullWhisperOutput = '';
            whisperProcess.stdout.on('data', data => {
                fullWhisperOutput += data.toString();
            });

            whisperProcess.stderr.on('data', data => {
                console.error(`whisperService: Whisper.cpp stderr: ${data}`);
            });

            whisperProcess.on('close', code => {
                if (code === 0) {
                    try {
                        const parsedOutput = JSON.parse(fullWhisperOutput);
                        const text = parsedOutput.text || "";
                        console.log('whisperService: Transcription successful.');
                        resolve(text.trim());
                    } catch (parseError) {
                        console.error("whisperService: Error parsing whisper.cpp output:", parseError);
                        reject(new Error("Failed to parse transcription output."));
                    }
                } else {
                    console.error(`whisperService: Whisper.cpp process exited with code ${code}`);
                    reject(new Error(`Transcription failed with code ${code}.`));
                }

                // Clean up temporary audio file
                if (currentAudioFileName && fs.existsSync(currentAudioFileName)) {
                    fs.unlink(currentAudioFileName, (err) => {
                        if (err) console.error("whisperService: Failed to delete temp audio file:", err);
                        else console.log("whisperService: Temp audio file deleted:", currentAudioFileName);
                    });
                }
            });

            whisperProcess.on('error', err => {
                console.error('whisperService: Failed to start whisper.cpp process:', err);
                reject(new Error("Failed to start transcription engine."));

                // Clean up in case of early error
                if (currentAudioFileName && fs.existsSync(currentAudioFileName)) {
                    fs.unlink(currentAudioFileName, (err) => { /* ignore error on cleanup */ });
                }
            });

        } catch (error) {
            console.error("whisperService: Error during audio file handling:", error);
            reject(new Error("Backend audio file processing failed."));
            if (currentAudioFileName && fs.existsSync(currentAudioFileName)) {
                fs.unlink(currentAudioFileName, (err) => { /* ignore error on cleanup */ });
            }
        }
    });
}

export {
    transcribeAudioWithWhisperCpp,

};
