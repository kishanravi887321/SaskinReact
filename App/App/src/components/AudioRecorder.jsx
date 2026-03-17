import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Play, Pause, Square, RotateCcw, Download,
  Volume2, VolumeX, Activity, Clock, Zap, AlertCircle, CheckCircle
} from 'lucide-react';
import RecordRTC from 'recordrtc';
import WaveSurfer from 'wavesurfer.js';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';

const AudioRecorder = ({
  onRecordingComplete,
  onTranscriptionUpdate,
  maxDuration = 120, // 2 minutes default
  autoStart = false,
  className = '',
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, recording, processing, complete

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  // Transcription state
  const [transcription, setTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [confidence, setConfidence] = useState(0);

  // Error handling
  const [error, setError] = useState('');

  // Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationRef = useRef(null);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Web Speech API
  const initSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let totalConfidence = 0;
        let resultCount = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            totalConfidence += confidence || 0.8; // Fallback confidence
            resultCount++;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscription(prev => prev + finalTranscript);
          setConfidence(resultCount > 0 ? totalConfidence / resultCount : 0.8);
          onTranscriptionUpdate?.(transcription + finalTranscript, totalConfidence / resultCount);
        }

        setInterimTranscription(interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }
  }, [transcription, onTranscriptionUpdate]);

  // Initialize WaveSurfer for audio visualization
  const initWaveSurfer = useCallback(() => {
    if (waveformRef.current && !waveSurferRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#10b981',
        progressColor: '#059669',
        cursorColor: '#ffffff',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 60,
        normalize: true,
      });

      waveSurferRef.current.on('ready', () => {
        console.log('WaveSurfer is ready');
      });

      waveSurferRef.current.on('play', () => {
        setIsPlaying(true);
      });

      waveSurferRef.current.on('pause', () => {
        setIsPlaying(false);
      });
    }
  }, []);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyzerRef.current) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyzerRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    setAudioLevel(Math.min(100, (average / 128) * 100));

    animationRef.current = requestAnimationFrame(monitorAudioLevel);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError('');
      setRecordingStatus('recording');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      // Setup audio context for level monitoring
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      source.connect(analyzerRef.current);

      // Start audio level monitoring
      monitorAudioLevel();

      // Setup RecordRTC
      mediaRecorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
      });

      mediaRecorderRef.current.startRecording();

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setDuration(0);
      setTranscription('');
      setInterimTranscription('');

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please check permissions.');
      setRecordingStatus('idle');
    }
  }, [maxDuration, monitorAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(() => {
    setRecordingStatus('processing');

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stopRecording(() => {
        const blob = mediaRecorderRef.current.getBlob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Initialize WaveSurfer with recorded audio
        if (waveSurferRef.current) {
          waveSurferRef.current.loadBlob(blob);
        }

        setRecordingStatus('complete');
        onRecordingComplete?.(blob, transcription, confidence);
      });
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Cleanup
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
    setAudioLevel(0);
  }, [transcription, confidence, onRecordingComplete]);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resumeRecording();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } else {
      mediaRecorderRef.current.pauseRecording();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    setIsPaused(!isPaused);
  }, [isPaused]);

  // Reset recording
  const resetRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }

    setDuration(0);
    setAudioUrl(null);
    setTranscription('');
    setInterimTranscription('');
    setConfidence(0);
    setRecordingStatus('idle');
    setError('');

    if (waveSurferRef.current) {
      waveSurferRef.current.empty();
    }
  }, [isRecording, stopRecording]);

  // Play/Pause playback
  const togglePlayback = useCallback(() => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
    }
  }, []);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize components
  useEffect(() => {
    initSpeechRecognition();
    initWaveSurfer();

    if (autoStart) {
      startRecording();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initSpeechRecognition, initWaveSurfer, autoStart, startRecording]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recording Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            recordingStatus === 'recording' ? 'bg-red-500 animate-pulse' :
            recordingStatus === 'processing' ? 'bg-yellow-500 animate-spin' :
            recordingStatus === 'complete' ? 'bg-green-500' :
            'bg-gray-500'
          }`} />
          <span className="text-sm font-medium text-white/80">
            {recordingStatus === 'recording' ? 'Recording' :
             recordingStatus === 'processing' ? 'Processing' :
             recordingStatus === 'complete' ? 'Complete' :
             'Ready to Record'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-white/70">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(duration)} / {formatTime(maxDuration)}
          </Badge>
          {confidence > 0 && (
            <Badge variant="outline" className={`${
              confidence > 0.8 ? 'text-green-400 border-green-500/30' :
              confidence > 0.6 ? 'text-yellow-400 border-yellow-500/30' :
              'text-red-400 border-red-500/30'
            }`}>
              <Zap className="w-3 h-3 mr-1" />
              {Math.round(confidence * 100)}% confident
            </Badge>
          )}
        </div>
      </div>

      {/* Main Recording Interface */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 rounded-2xl p-6 border border-white/10">
        {/* Audio Level Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Audio Level</span>
          </div>
          <Progress value={audioLevel} className="h-2" />
        </div>

        {/* Waveform Visualization */}
        <div className="mb-6">
          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div ref={waveformRef} className="w-full" />
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 transition-all duration-200"
              disabled={recordingStatus === 'processing'}
            >
              <Mic className="w-6 h-6 text-white" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={togglePause}
                variant="secondary"
                className="w-12 h-12 rounded-full"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>

              <Button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
              >
                <Square className="w-6 h-6 text-white" />
              </Button>
            </div>
          )}

          {audioUrl && (
            <Button
              onClick={togglePlayback}
              variant="secondary"
              className="w-12 h-12 rounded-full"
              disabled={recordingStatus === 'recording'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          )}

          <Button
            onClick={resetRecording}
            variant="secondary"
            className="w-12 h-12 rounded-full"
            disabled={recordingStatus === 'recording'}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Duration and Progress */}
        <div className="mb-4">
          <Progress
            value={(duration / maxDuration) * 100}
            className="h-1 mb-2"
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>{formatTime(duration)}</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
        </div>
      </div>

      {/* Real-time Transcription */}
      <AnimatePresence>
        {(transcription || interimTranscription) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Volume2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-300">Live Transcription</span>
              {confidence > 0 && (
                <Badge className={`text-xs ${
                  confidence > 0.8 ? 'bg-green-500/20 text-green-300' :
                  confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {Math.round(confidence * 100)}%
                </Badge>
              )}
            </div>

            <div className="text-white/90 leading-relaxed">
              <span className="text-white">{transcription}</span>
              <span className="text-white/50 italic">{interimTranscription}</span>
              {(transcription || interimTranscription) && (
                <span className="animate-pulse text-blue-400 ml-1">|</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioRecorder;