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
    const response = await fetch('/game-data.json', {
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
        <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-8">
          LOADING...
        </div>
      );
    }
    
    if (error || !gameData) {
      return (
        <div className="text-4xl md:text-5xl font-bold text-red-400 mb-8">
          ERROR
        </div>
      );
    }

    if (gameData.error) {
      return (
        <div className="text-4xl md:text-5xl font-bold text-red-400 mb-8">
          API ERROR
        </div>
      );
    }

    if (!gameData.didWin === undefined || !gameData.gameInfo) {
      return (
        <div className="text-4xl md:text-5xl font-bold text-gray-400 mb-8">
          NO DATA
        </div>
      );
    }
    
    return (
      <>
        <div className={`text-8xl md:text-9xl font-bold mb-8 ${
          gameData.didWin ? 'text-green-400' : 'text-red-400'
        }`}>
          {gameData.didWin ? 'YES' : 'NO'}
        </div>
        
        <div className="text-xl md:text-2xl mb-16">
          <p>{gameData.gameInfo}</p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-blue-600 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-4">
        <button className="text-white hover:text-blue-200 transition-colors">
          Home
        </button>
        <Link href="/newsletter" className="text-white hover:text-blue-200 transition-colors">
          Newsletter
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center text-center px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
          Did the Dodgers<br />
          Win at Home?
        </h1>
        
        {displayResult()}
        
        <div className="text-lg space-y-2">
          <p>
            Last refreshed: {timeAgo}
            {gameData?.lastUpdated && (
              <span className="text-blue-200 block text-base mt-1">
                ({formatPSTTime(gameData.lastUpdated)})
              </span>
            )}
          </p>
          <div className="text-sm text-blue-200">
            Auto-updates every 30 minutes
          </div>
        </div>
      </div>
    </div>
  );
}
