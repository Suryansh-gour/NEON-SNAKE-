import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music as MusicIcon } from 'lucide-react';
import { Track } from '../types';

const INITIAL_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'Zen_Man',
    url: 'https://cdn.pixabay.com/audio/2022/01/21/audio_2e2f3d2f9d.mp3'
  },
  {
    id: '2',
    title: 'Cyberpunk City',
    artist: 'Lexin_Music',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_f5e61d8f5d.mp3'
  },
  {
    id: '3',
    title: 'Future Retro',
    artist: 'Coma-Media',
    url: 'https://cdn.pixabay.com/audio/2021/11/23/audio_0de38676a0.mp3'
  }
];

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentTrack = INITIAL_TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % INITIAL_TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + INITIAL_TRACKS.length) % INITIAL_TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [currentTrackIndex]);

  return (
    <div id="music-player" className="fixed bottom-6 right-6 z-50">
      <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center gap-4 transition-all hover:border-cyan-400/50">
        <div className="relative group">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center animate-pulse ${isPlaying ? 'animate-spin-slow' : ''}`}>
             <MusicIcon className="text-white w-6 h-6" />
          </div>
          {isPlaying && (
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              <div className="w-1 h-3 bg-cyan-400 rounded-full animate-music-bar-1" />
              <div className="w-1 h-4 bg-purple-400 rounded-full animate-music-bar-2" />
              <div className="w-1 h-2 bg-cyan-400 rounded-full animate-music-bar-3" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider truncate w-32">
            {currentTrack.title}
          </span>
          <span className="text-gray-400 text-[10px] font-medium uppercase truncate w-32">
            {currentTrack.artist}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={prevTrack}
            id="prev-track"
            className="p-1.5 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button 
            onClick={togglePlay}
            id="play-pause"
            className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>

          <button 
            onClick={nextTrack}
            id="next-track"
            className="p-1.5 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <audio 
          ref={audioRef} 
          src={currentTrack.url} 
          onEnded={nextTrack}
          loop={false}
        />
      </div>
      
      <style>{`
        @keyframes music-bar-1 { 0%, 100% { height: 4px; } 50% { height: 12px; } }
        @keyframes music-bar-2 { 0%, 100% { height: 16px; } 50% { height: 8px; } }
        @keyframes music-bar-3 { 0%, 100% { height: 6px; } 50% { height: 14px; } }
        .animate-music-bar-1 { animation: music-bar-1 1s ease-in-out infinite; }
        .animate-music-bar-2 { animation: music-bar-2 1.2s ease-in-out infinite; }
        .animate-music-bar-3 { animation: music-bar-3 0.8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
};
