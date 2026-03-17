import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, RotateCcw, Download,
  Loader2, CheckCircle, AlertCircle, Headphones, Settings
} from 'lucide-react';
import { Howl, Howler } from 'howler';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';

const AudioPlayer = ({
  audioUrl,
  audioText = '',
  autoPlay = false,
  showControls = true,
  showTranscript = true,
  onPlaybackComplete,
  onError,
  className = '',
}) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Status and error handling
  const [status, setStatus] = useState('idle'); // idle, loading, ready, playing, paused, completed, error
  const [error, setError] = useState('');

  // Text-to-speech state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [synthesis, setSynthesis] = useState(null);

  // Refs
  const howlRef = useRef(null);
  const progressRef = useRef(null);

  // Initialize Howler audio
  const initializeAudio = useCallback(() => {
    if (!audioUrl) return;

    setIsLoading(true);
    setStatus('loading');
    setError('');

    // Cleanup previous audio
    if (howlRef.current) {
      howlRef.current.unload();
    }

    howlRef.current = new Howl({
      src: [audioUrl],
      volume: isMuted ? 0 : volume,
      rate: playbackRate,
      onload: () => {
        setIsLoading(false);
        setStatus('ready');
        setDuration(howlRef.current.duration());

        if (autoPlay) {
          playAudio();
        }
      },
      onloaderror: (id, error) => {
        console.error('Audio load error:', error);
        setIsLoading(false);
        setStatus('error');
        setError('Failed to load audio');
        onError?.(error);
      },
      onplay: () => {
        setIsPlaying(true);
        setStatus('playing');
        updateProgress();
      },
      onpause: () => {
        setIsPlaying(false);
        setStatus('paused');
      },
      onstop: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setStatus('ready');
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setStatus('completed');
        onPlaybackComplete?.();
      },
      onseek: () => {
        updateProgress();
      },
    });
  }, [audioUrl, volume, isMuted, playbackRate, autoPlay, onPlaybackComplete, onError]);

  // Update progress
  const updateProgress = useCallback(() => {
    if (!howlRef.current || !isPlaying) return;

    const seek = howlRef.current.seek() || 0;
    setCurrentTime(seek);

    if (isPlaying) {
      progressRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  // Play audio
  const playAudio = useCallback(() => {
    if (!howlRef.current) return;

    howlRef.current.play();
  }, []);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (!howlRef.current) return;

    howlRef.current.pause();
  }, []);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (!howlRef.current) return;

    howlRef.current.stop();
  }, []);

  // Toggle play/pause
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, pauseAudio]);

  // Seek to position
  const seekTo = useCallback((position) => {
    if (!howlRef.current) return;

    howlRef.current.seek(position);
    setCurrentTime(position);
  }, []);

  // Set volume
  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);

    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : newVolume);
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (howlRef.current) {
      howlRef.current.volume(newMuted ? 0 : volume);
    }
  }, [isMuted, volume]);

  // Change playback speed
  const changePlaybackRate = useCallback((rate) => {
    setPlaybackRate(rate);

    if (howlRef.current) {
      howlRef.current.rate(rate);
    }
  }, []);

  // Generate audio from text using Web Speech API
  const generateAudioFromText = useCallback(async () => {
    if (!audioText || !('speechSynthesis' in window)) {
      setError('Text-to-speech not supported');
      return;
    }

    setIsGeneratingAudio(true);
    setStatus('loading');

    try {
      const utterance = new SpeechSynthesisUtterance(audioText);

      // Configure speech synthesis
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to use a professional voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Microsoft') ||
        voice.name.includes('Google') ||
        voice.lang.startsWith('en')
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsGeneratingAudio(false);
        setIsPlaying(true);
        setStatus('playing');
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setStatus('completed');
        onPlaybackComplete?.();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsGeneratingAudio(false);
        setStatus('error');
        setError('Text-to-speech failed');
        onError?.(event.error);
      };

      speechSynthesis.speak(utterance);
      setSynthesis(utterance);

    } catch (error) {
      console.error('Error generating audio:', error);
      setIsGeneratingAudio(false);
      setStatus('error');
      setError('Failed to generate audio');
      onError?.(error);
    }
  }, [audioText, onPlaybackComplete, onError]);

  // Format time display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize on mount and when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      initializeAudio();
    } else if (audioText && !audioUrl) {
      // If no audio URL but text is provided, use text-to-speech
      setStatus('ready');
    }

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
      if (howlRef.current) {
        howlRef.current.unload();
      }
      if (synthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [audioUrl, audioText, initializeAudio]);

  // Load voices for speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        speechSynthesis.getVoices();
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-yellow-400';
      case 'ready': case 'paused': return 'text-blue-400';
      case 'playing': return 'text-green-400';
      case 'completed': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'ready': case 'paused': return <Headphones className="w-4 h-4" />;
      case 'playing': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Headphones className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {status === 'loading' ? 'Loading Audio...' :
             status === 'ready' ? 'Ready to Play' :
             status === 'playing' ? 'Playing' :
             status === 'paused' ? 'Paused' :
             status === 'completed' ? 'Completed' :
             status === 'error' ? 'Error' :
             'Audio Player'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {audioUrl && (
            <Badge variant="outline" className="text-white/70">
              Audio File
            </Badge>
          )}
          {audioText && !audioUrl && (
            <Badge variant="outline" className="text-blue-400 border-blue-500/30">
              Text-to-Speech
            </Badge>
          )}
        </div>
      </div>

      {/* Main Player Interface */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 rounded-xl p-5 border border-white/10">
        {/* Progress Bar */}
        {duration > 0 && (
          <div className="mb-4">
            <div
              className="w-full h-2 bg-white/10 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const position = ((e.clientX - rect.left) / rect.width) * duration;
                seekTo(position);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-150"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {showControls && (
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Main Play/Pause Button */}
            <Button
              onClick={() => {
                if (audioUrl) {
                  togglePlayback();
                } else if (audioText) {
                  if (status === 'playing') {
                    speechSynthesis.cancel();
                    setIsPlaying(false);
                    setStatus('ready');
                  } else {
                    generateAudioFromText();
                  }
                }
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400"
              disabled={status === 'loading' || isGeneratingAudio || (!audioUrl && !audioText)}
            >
              {(isLoading || isGeneratingAudio) ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </Button>

            {/* Stop Button */}
            {audioUrl && (
              <Button
                onClick={stopAudio}
                variant="secondary"
                className="w-10 h-10 rounded-full"
                disabled={status === 'loading'}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                className="w-8 h-8 rounded-full"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <div className="w-20">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Playback Speed */}
            {audioUrl && (
              <div className="flex items-center gap-1">
                {[0.75, 1, 1.25, 1.5].map(rate => (
                  <Button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    variant={playbackRate === rate ? "default" : "ghost"}
                    className="w-8 h-8 rounded text-xs"
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transcript Display */}
        {showTranscript && audioText && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Transcript</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">{audioText}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </motion.div>
      )}
    </div>
  );
};

export default AudioPlayer;