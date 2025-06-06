'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Type definitions for the game data
interface GameData {
  didWin?: boolean;
  gameInfo?: string;
  lastUpdated: string;
  error?: string;
}

const fetchGameData = async (): Promise<GameData | null> => {
  try {
    const response = await fetch('/api/game-data', {
      cache: 'no-store' // Prevent caching to always get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch game data');
    }
    
    const data: GameData = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching game data:', error);
    return null;
  }
};

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const updated = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

const formatPSTTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const pstTime = date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric'
  });
  return `${pstTime} PST`;
};

// Function to highlight team names in game info
const formatGameInfo = (gameInfo: string) => {
  // Simple pattern to highlight team name after "against the"
  return gameInfo.replace(
    /(against the\s+)([^.]+)/gi,
    '$1<span class="font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">$2</span>'
  );
};

// Loading animation component
const LoadingDots = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
  </div>
);

// Status indicator component
const StatusIndicator = ({ status }: { status: 'loading' | 'success' | 'error' }) => {
  const colors = {
    loading: 'bg-yellow-400',
    success: 'bg-green-400',
    error: 'bg-red-400'
  };
  
  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} animate-pulse`}></div>
  );
};

export default function Home() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        const data = await fetchGameData();
        setGameData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, []);
 
  // Update time ago every second
  useEffect(() => {
    if (!gameData?.lastUpdated) return;

    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(gameData.lastUpdated));
    };

    updateTimeAgo(); // Initial update
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [gameData?.lastUpdated]);

  const displayResult = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center space-y-6">
          <div className="text-5xl md:text-6xl font-bold text-slate-400 mb-4 animate-pulse">
            LOADING
          </div>
          <LoadingDots />
        </div>
      );
    }
    
    if (error || !gameData) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-5xl md:text-6xl font-bold text-red-400 mb-4">
            ERROR
          </div>
          <div className="text-slate-300 text-lg">Unable to fetch game data</div>
        </div>
      );
    }

    if (gameData.error) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-5xl md:text-6xl font-bold text-red-400 mb-4">
            API ERROR
          </div>
          <div className="text-slate-300 text-lg">Service temporarily unavailable</div>
        </div>
      );
    }

    if (gameData.didWin === undefined || !gameData.gameInfo) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-5xl md:text-6xl font-bold text-slate-400 mb-4">
            NO DATA
          </div>
          <div className="text-slate-300 text-lg">No recent game information available</div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center space-y-8">
        <div className={`text-8xl md:text-9xl font-black mb-4 transform transition-all duration-700 hover:scale-105 tracking-wider ${
          gameData.didWin 
            ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]' 
            : 'text-rose-400 drop-shadow-[0_0_20px_rgba(251,113,133,0.5)]'
        }`}>
          {gameData.didWin ? 'YES' : 'NO'}
        </div>
        
        <div className="text-xl md:text-2xl text-slate-200 font-light tracking-wide">
          <p dangerouslySetInnerHTML={{ __html: formatGameInfo(gameData.gameInfo) }} />
        </div>
      </div>
    );
  };

  const getStatusIndicator = () => {
    if (loading) return 'loading';
    if (error || !gameData || gameData.error) return 'error';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
        <button className="text-white hover:text-blue-300 transition-colors duration-300 font-medium tracking-wide">
          Home
        </button>
        <div className="flex space-x-6">
          <Link href="/newsletter" className="text-white hover:text-blue-300 transition-colors duration-300 font-medium tracking-wide">
            Newsletter
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-16 min-h-[calc(100vh-120px)]">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-wide">
              Did the <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Dodgers</span><br />
              Win at Home?
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-transparent mx-auto rounded-full"></div>
          </div>
          
          {/* Result */}
          <div className="py-8">
            {displayResult()}
          </div>
          
          {/* Status and timing info */}
          <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-center space-x-3">
              <StatusIndicator status={getStatusIndicator()} />
              <span className="text-lg font-medium">
                Last refreshed: {timeAgo}
              </span>
            </div>
            
            {gameData?.lastUpdated && (
              <div className="text-slate-300 text-sm">
                ({formatPSTTime(gameData.lastUpdated)})
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Auto-updates every 30 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
