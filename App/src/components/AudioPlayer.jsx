import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, RotateCcw, Download,
  SkipBack, SkipForward, Clock, AudioLines, Settings,
  Headphones, Activity, Zap, AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';

const AudioPlayer = ({
  audioSrc,
  transcript = '',
  onPlaybackComplete,
  autoPlay = false,
  showTranscript = true,
  showControls = true,
  className = '',
  title = 'AI Response'
}) => {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Transcript state
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const [transcriptWords, setTranscriptWords] = useState([]);

  // TTS state
  const [useTTS, setUseTTS] = useState(false);
  const [ttsVoice, setTtsVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Error handling
  const [error, setError] = useState('');

  // Refs
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const speechRef = useRef(null);

  // Initialize voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Find a good default voice (prefer female, English)
      const defaultVoice = voices.find(voice =>
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

      setTtsVoice(defaultVoice);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Process transcript into words for highlighting
  useEffect(() => {
    if (transcript) {
      const words = transcript.split(/\s+/).filter(word => word.length > 0);
      setTranscriptWords(words);
    }
  }, [transcript]);

  // Audio event handlers
  const handleLoadStart = () => setIsLoading(true);

  const handleCanPlay = () => {
    setIsLoading(false);
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (autoPlay) {
        playAudio();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Update highlighted word based on audio progress
      if (transcriptWords.length > 0) {
        const progress = audioRef.current.currentTime / audioRef.current.duration;
        const wordIndex = Math.floor(progress * transcriptWords.length);
        setHighlightedWord(Math.min(wordIndex, transcriptWords.length - 1));
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHighlightedWord(-1);
    onPlaybackComplete?.();
  };

  const handleError = () => {
    setError('Failed to load audio');
    setIsLoading(false);
    setIsPlaying(false);
  };

  // Playback controls
  const playAudio = useCallback(() => {
    if (useTTS && transcript) {
      playTTS();
    } else if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('Playback failed'));
    }
  }, [useTTS, transcript]);

  const pauseAudio = useCallback(() => {
    if (speechRef.current) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, pauseAudio]);

  const restartAudio = useCallback(() => {
    if (speechRef.current) {
      speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setHighlightedWord(-1);
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback((time) => {
    if (audioRef.current && !useTTS) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [useTTS]);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  }, [isMuted]);

  const changePlaybackRate = useCallback((rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // TTS playback
  const playTTS = useCallback(() => {
    if (!transcript || !ttsVoice) return;

    speechSynthesis.cancel(); // Cancel any existing speech

    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.voice = ttsVoice;
    utterance.rate = playbackRate;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentTime(0);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const progress = event.charIndex / transcript.length;
        const wordIndex = Math.floor(progress * transcriptWords.length);
        setHighlightedWord(Math.min(wordIndex, transcriptWords.length - 1));
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHighlightedWord(-1);
      onPlaybackComplete?.();
    };

    utterance.onerror = () => {
      setError('Text-to-speech failed');
      setIsPlaying(false);
    };

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [transcript, ttsVoice, playbackRate, volume, transcriptWords.length, onPlaybackComplete]);

  // Download audio
  const downloadAudio = useCallback(() => {
    if (audioSrc) {
      const link = document.createElement('a');
      link.href = audioSrc;
      link.download = `${title.replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [audioSrc, title]);

  // Format time display
  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-xs text-white/60">
              {useTTS ? 'Text-to-Speech' : 'Audio Response'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Toggle */}
          {transcript && (
            <Button
              onClick={() => setUseTTS(!useTTS)}
              variant="outline"
              size="sm"
              className={`text-xs ${useTTS ? 'bg-blue-500/20 border-blue-500/30' : ''}`}
            >
              <Zap className="w-3 h-3 mr-1" />
              TTS
            </Button>
          )}

          {/* Status Indicator */}
          <div className={`w-2 h-2 rounded-full ${
            isLoading ? 'bg-yellow-500 animate-pulse' :
            isPlaying ? 'bg-green-500 animate-pulse' :
            error ? 'bg-red-500' :
            'bg-gray-500'
          }`} />
        </div>
      </div>

      {/* Main Player Interface */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 rounded-2xl p-5 border border-white/10">
        {/* Progress Bar */}
        <div className="mb-4">
          <div
            ref={progressRef}
            className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
            onClick={(e) => {
              if (!useTTS && audioRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seekTo(percent * duration);
              }
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-150 opacity-0 group-hover:opacity-100"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/50">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Restart */}
            <Button
              onClick={restartAudio}
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Main Play/Pause */}
            <Button
              onClick={togglePlayback}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-200"
              disabled={isLoading || (!audioSrc && !transcript)}
            >
              {isLoading ? (
                <Activity className="w-6 h-6 text-white animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </Button>

            {/* Download */}
            {audioSrc && (
              <Button
                onClick={downloadAudio}
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-full"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-full"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* Playback Rate Controls */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                playbackRate === rate
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Transcript Display */}
      {showTranscript && transcript && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-5 border border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <AudioLines className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-green-300">Transcript</span>
              {isPlaying && (
                <Badge className="text-xs bg-green-500/20 text-green-300">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  Playing
                </Badge>
              )}
            </div>

            <div className="text-white/90 leading-relaxed">
              {transcriptWords.map((word, index) => (
                <span
                  key={index}
                  className={`transition-all duration-200 ${
                    index === highlightedWord
                      ? 'bg-blue-500/30 text-blue-200 px-1 rounded'
                      : 'text-white/80'
                  }`}
                >
                  {word}{' '}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

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
            <Button
              onClick={() => setError('')}
              variant="ghost"
              size="sm"
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioPlayer;