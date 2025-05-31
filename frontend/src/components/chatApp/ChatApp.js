"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, Mic, MicOff } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent} from '../../components/ui/card';


export default function TheraChat({ onBack }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      content: "Hello, beautiful soul. I'm Thera, and I'm here to listen with my whole heart. What's stirring within you today? 🌸",
      sender: "thera",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();

  // Refs for audio processing
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
   const mediaRecorderRef = useRef(null); //
  const audioProcessorRef = useRef(null);
  const accumulatedTranscriptRef = useRef(""); // To hold the full transcript for the current utterance

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null; // Clear ref
      }
      if (mediaRecorderRef.current) {
        // Stop all tracks on the stream associated with mediaRecorder
        // This part depends on how mediaRecorderRef is used, which is currently unused.
        // If you were using MediaRecorder, ensure its stream's tracks are stopped.
        if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        mediaRecorderRef.current = null; // Clear ref
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null; // Clear ref
      }
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect();
        audioProcessorRef.current = null; // Clear ref
      }
    };
  }, [messages, isTyping]); // Added isTyping to dependency array to ensure scroll happens after typing indicator appears/disappears

  const getTheraResponse = async (prompt) => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const theraMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply || "[Sorry, I couldn't get a response.]",
        sender: "thera",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, theraMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "[Error connecting to Thera. Please try again later.]",
        sender: "thera",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = currentMessage;
    setCurrentMessage("");
    accumulatedTranscriptRef.current = ""; // Reset accumulated transcript for next voice input

    await getTheraResponse(messageContent);
  };

  // Determine appropriate Whisper model based on device capabilities
  const getWhisperModel = () => {
    // Check device capabilities
    const isHighPerfDevice = (
      navigator.hardwareConcurrency > 4 &&
      navigator.deviceMemory > 4 &&
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );

    return isHighPerfDevice ? "whisper-large-v3" : "whisper-medium";
  };

  // Initialize WebSocket connection
  const initWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        console.log("WebSocket already open.");
        return;
    }
    const socket = new WebSocket('ws://localhost:5000'); // Correct WebSocket URL
    //const socket = new WebSocket(WS_ENDPOINT);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus("connected");
      console.log("WebSocket connected. Sending config...");
      // Send model information first
      socket.send(JSON.stringify({
        type: "config",
        model: getWhisperModel(),
        sampleRate: 16000
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "transcript") {
        accumulatedTranscriptRef.current = data.text;
        setCurrentMessage(data.text);
          }
      else if (data.type === "partial") {
        // Update currentMessage with partial + accumulated to show ongoing transcription
        setCurrentMessage(accumulatedTranscriptRef.current + data.text);
      }
      else if (data.type === "error") {
        console.error("Transcription error from server:", data.message);
        setIsTranscribing(false);
        setIsListening(false); // Stop listening on server-side error
        alert(`Transcription error: ${data.message}. Please try again.`);
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setConnectionStatus("disconnected");
      setIsTranscribing(false);
      setIsListening(false); // Ensure UI reflects non-listening state
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
      setIsTranscribing(false);
      setIsListening(false); // Ensure UI reflects non-listening state
      alert("WebSocket connection error. Check server and network.");
    };
  };

  // Process audio data and send via WebSocket
  const processAudio = (audioData) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(audioData);
    } else {
        console.warn("WebSocket not open, cannot send audio data.");
    }
  };

  // Start audio recording and processing
  const startRecording = async () => {
    try {
      // Initialize WebSocket first
      initWebSocket();

      // Wait for connection to establish with a timeout
      let connectionPromise = new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
          reject(new Error("WebSocket connection timed out."));
        }, 5000); // 5 seconds timeout
        const checkConnection = () => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            clearTimeout(timeout);
            resolve();
          } else if (connectionStatus === "error" || connectionStatus === "disconnected") {
            clearTimeout(timeout);
            reject(new Error("WebSocket connection failed."));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });

      await connectionPromise; // Wait for the connection

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create audio processor
      // The ScriptProcessorNode is deprecated, but still widely supported.
      // For new code, AudioWorkletNode is the modern alternative.
      audioProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      audioProcessorRef.current.onaudioprocess = (event) => {
        const audioBuffer = event.inputBuffer;
        const pcmData = new Float32Array(audioBuffer.getChannelData(0));
        const int16Data = new Int16Array(pcmData.length);

        // Convert to 16-bit PCM (signed 16-bit integers)
        // Values range from -32768 to 32767
        for (let i = 0; i < pcmData.length; i++) {
          const s = Math.max(-1, Math.min(1, pcmData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        processAudio(int16Data.buffer);
      };

      source.connect(audioProcessorRef.current);
      audioProcessorRef.current.connect(audioContextRef.current.destination); // Connect to destination to keep it alive
      setIsTranscribing(true);
      setIsListening(true); // Ensure listening state is set here too

    } catch (error) {
      console.error("Error starting recording with Web Audio API:", error);
      setIsTranscribing(false);
      setIsListening(false); // Reset states

      // Close socket if opened but recording failed
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }

      // Fallback to built-in SpeechRecognition API if getUserMedia fails
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        alert("Audio transcription not supported in this browser. Please try Google Chrome.");
        return;
      }
      console.warn("Falling back to browser's SpeechRecognition API.");
      startVoiceInputFallback();
    }
  };

  // Fallback method for browsers without Web Audio API or if Web Audio fails
  const startVoiceInputFallback = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support voice recognition. Try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Set to false for single utterance, true for continuous
    recognition.interimResults = true; // Get partial results
    recognition.lang = "en-US";

    recognition.onstart = () => {
        setIsListening(true);
        console.log("SpeechRecognition started.");
    };

    recognition.onend = () => {
        setIsListening(false);
        console.log("SpeechRecognition ended.");
        // If a final transcript is available when recognition ends, send it
        // This will automatically send the message after the user stops speaking
        if (currentMessage.trim() && !isTyping) {
            handleSendMessage();
        }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Update the input field with the combined transcript
      // This is crucial to show the user what's being transcribed
      setCurrentMessage(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      alert(`Speech recognition error: ${event.error}. Please ensure microphone access.`);
    };

    // Ensure only one recognition instance is active
    if (window.activeSpeechRecognition) {
        window.activeSpeechRecognition.stop();
    }
    recognition.start();
    window.activeSpeechRecognition = recognition; // Store active recognition instance
  };

  // Toggle voice input
  const startVoiceInput = async () => {
    if (isListening) {
      // Stop recording
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect();
        audioProcessorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null; // Clear ref
      }
      // If fallback was active, stop it
      if (window.activeSpeechRecognition) {
          window.activeSpeechRecognition.stop();
          window.activeSpeechRecognition = null;
      }
      setIsListening(false);
      setIsTranscribing(false);
      // If there's an ongoing partial transcript, treat it as final and send it
      if (currentMessage.trim() && !isTyping) {
        handleSendMessage();
      }
      return;
    }

    // Start voice input
    setIsListening(true);
    accumulatedTranscriptRef.current = ""; // Clear accumulated transcript for new recording
    setCurrentMessage(""); // Clear input field for new recording
    await startRecording(); // This will try Web Audio API first, then fall back.
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Video/Image */}
      <div className="fixed inset-0 z-0">
        {theme === "dark" ? (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/bioluminescent-waterfall.jpg')",
            }}
          />
        ) : (
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/Pinterest-Alice-.mp4" type="video/mp4" />
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('bright-waterfall.jpg')",
              }}
            />
          </video>
        )}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/10 dark:bg-black/20 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/50 p-4"
      >
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20 dark:hover:bg-black/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-healing-teal to-growth-lime flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-white text-lg">🌿</span>
            </motion.div>

            <div>
              <h1 className="font-semibold text-white">Thera</h1>
              <p className="text-sm text-white/70">
                {isTyping
                  ? "Thera is reflecting..."
                  : isTranscribing || isListening // Show listening if either is true
                    ? "Listening deeply..."
                    : "Your soul companion"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connection Status Indicator */}
      {connectionStatus !== "disconnected" && (
        <div className={`fixed top-16 right-4 z-20 px-3 py-1 rounded-full text-xs ${
          connectionStatus === "connected"
            ? "bg-growth-lime/80 text-gray-800"
            : "bg-rose-500/80 text-white"
        }`}>
          {connectionStatus === "connected" ? "Connected" : "Connection Error"}
        </div>
      )}

      {/* Messages */}
      <div className="max-w-4xl mx-auto p-4 pb-32 relative z-10">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs md:max-w-md ${message.sender === "user" ? "order-2" : "order-1"}`}>
                  {message.sender === "thera" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-healing-teal to-growth-lime flex items-center justify-center">
                        <span className="text-white text-xs">🌿</span>
                      </div>
                      <span className="text-xs text-white/70">Thera</span>
                    </div>
                  )}

                  <Card
                    className={`${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-healing-teal to-growth-lime text-white border-none"
                        : "bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <p className={"text-white"}>{message.content}</p>
                       <p className="text-xs mt-2 text-right text-white/70">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-healing-teal to-growth-lime flex items-center justify-center">
                    <span className="text-white text-xs">🌿</span>
                  </div>
                  <span className="text-xs text-white/70">Thera is reflecting...</span>
                </div>

                <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/50">
                  <CardContent className="p-4">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-healing-teal rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm border-t border-white/20 dark:border-gray-700/50 p-4 z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                placeholder="Share what's in your heart..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-32 resize-none border-white/20 dark:border-gray-600/50 focus:border-healing-teal dark:focus:border-healing-teal bg-white/10 dark:bg-black/20 text-white placeholder:text-white/70"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={startVoiceInput}
                className={`border-white/20 dark:border-gray-600/50 text-white hover:bg-white/20 dark:hover:bg-black/30 ${
                    // Make the pulse animation dependent on isListening, not just isTranscribing
                    isListening ? "bg-red-500/50 animate-pulse" : ""
                }`}
                // Disable button if AI is typing, otherwise enable for voice input
                disabled={isTyping}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping || isTranscribing || isListening} // Disable send while listening or transcribing
                className="bg-gradient-to-r from-healing-teal to-growth-lime hover:from-healing-teal-dark hover:to-growth-lime/90 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-white/60 mt-2 text-center">
            {isTranscribing
              ? "Listening... (sending audio for transcription)"
              : isListening && !isTranscribing // Only show this if SpeechRecognition fallback is active
                ? "Listening... (browser speech recognition)"
                : "Thera is always here for you 💜"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
