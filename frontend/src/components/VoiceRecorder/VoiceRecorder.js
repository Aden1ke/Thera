import React, { useState, useRef } from 'react';

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setTranscript('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');

      {/*try {
        const response = await fetch('http://localhost:5000/api/whisper/transcribe', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log('Transcription response:', data); // ✅ Debug log
        setTranscript(data.text || 'No transcript received');
      } catch (error) {
        console.error('Error:', error);
        setTranscript('Error during transcription');
      }*/}
      try {
  const response = await fetch('http://localhost:5000/api/whisper/transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log('✅ Transcription response:', data);
  console.log('ℹ️ Type:', typeof data);
  console.log('📦 Keys:', Object.keys(data));

  setTranscript(data.text || 'No transcript received');
} catch (error) {
  console.error('❌ Error during transcription:', error);
  setTranscript('Error during transcription');
}

    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>Transcript: {transcript}</p>
    </div>
  );
}

