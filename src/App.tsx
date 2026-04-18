import React, { useRef, useState, useEffect } from 'react';
import { audioAnalyzer } from './lib/audioAnalyzer';
import { useAudioStore } from './store/audioStore';

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { isPlaying, currentTrackName, bands, setPlaying, setTrackName } = useAudioStore();

  useEffect(() => {
    return () => {
      audioAnalyzer.cleanup();
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file (MP3, WAV).');
      return;
    }
    
    setError(null);
    setTrackName(file.name);

    if (audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      // Note: We don't auto-play to respect browser autoplay policies.
      // The user must click the play button.
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      try {
        audioAnalyzer.initialize(audioRef.current);
        audioAnalyzer.startLoop();
        setPlaying(true);
      } catch (err) {
        console.error("Audio Context Init Error:", err);
        setError("Failed to initialize audio context.");
      }
    }
  };

  const handlePause = () => {
    audioAnalyzer.stopLoop();
    setPlaying(false);
  };

  // Phase 1 requirement: log to console
  useEffect(() => {
    if (isPlaying) {
      console.log(`Bass: ${bands.bass.toFixed(2)} | Mid: ${bands.mid.toFixed(2)} | Treble: ${bands.treble.toFixed(2)}`);
    }
  }, [bands, isPlaying]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Spectra Phase 1
      </h1>
      
      <div className="bg-[#111] p-8 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Upload Audio Track</label>
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-600 file:text-white
              hover:file:bg-purple-700
              transition-all cursor-pointer"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded">
            {error}
          </div>
        )}

        {currentTrackName && (
          <div className="mb-6 text-sm text-gray-300">
            <span className="font-semibold text-gray-100">Loaded:</span> {currentTrackName}
          </div>
        )}

        <audio 
          ref={audioRef}
          controls 
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handlePause}
          className="w-full"
        />

        {isPlaying && (
          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Raw Frequency Data</h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Bass</span>
                <span>{bands.bass.toFixed(0)}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-75" 
                  style={{ width: `${(bands.bass / 255) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Mid</span>
                <span>{bands.mid.toFixed(0)}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-75" 
                  style={{ width: `${(bands.mid / 255) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Treble</span>
                <span>{bands.treble.toFixed(0)}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-75" 
                  style={{ width: `${(bands.treble / 255) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
