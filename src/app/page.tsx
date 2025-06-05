'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Type definitions for the ESPN API response
interface Team {
  id: string;
  abbreviation: string;
  displayName: string;
}

interface Competitor {
  id: string;
  team: Team;
  homeAway: 'home' | 'away';
  winner: boolean;
  score: string;
}

interface Competition {
  id: string;
  competitors: Competitor[];
  venue: {
    fullName: string;
    address: {
      city: string;
      state: string;
    };
  };
  status: {
    type: {
      completed: boolean;
    };
  };
}

interface Event {
  id: string;
  date: string;
  competitions: Competition[];
}

interface ESPNResponse {
  events: Event[];
}

const fetchDodgersRecentGames = async (): Promise<{ didWin: boolean; gameInfo: string } | null> => {
  try {
    // Fetch recent Dodgers games from ESPN API
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/19/schedule');
    
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    
    const data: ESPNResponse = await response.json();
    
    // Find the most recent completed home game
    const recentHomeGames = data.events
      .filter(event => {
        const competition = event.competitions[0];
        // Check if game is completed and at Dodger Stadium
        return competition.status.type.completed && 
               competition.venue.fullName === 'Dodger Stadium';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (recentHomeGames.length === 0) {
      return null;
    }
    
    const mostRecentGame = recentHomeGames[0];
    const competition = mostRecentGame.competitions[0];
    
    // Find the Dodgers in the competitors array
    const dodgersCompetitor = competition.competitors.find(
      competitor => competitor.team.id === '19'
    );
    
    if (!dodgersCompetitor) {
      return null;
    }
    
    // Get opponent info
    const opponent = competition.competitors.find(
      competitor => competitor.team.id !== '19'
    );
    
    const gameDate = new Date(mostRecentGame.date).toLocaleDateString();
    const gameInfo = `on ${gameDate} against the ${opponent?.team.displayName || 'opponent'}`;
    
    return {
      didWin: dodgersCompetitor.winner,
      gameInfo
    };
    
  } catch (error) {
    console.error('Error fetching Dodgers game data:', error);
    return null;
  }
};

export default function Home() {
  const [gameResult, setGameResult] = useState<{ didWin: boolean; gameInfo: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGameResult = async () => {
      try {
        setLoading(true);
        const result = await fetchDodgersRecentGames();
        setGameResult(result);
        setError(null);
      } catch (err) {
        setError('Failed to load game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGameResult();
  }, []);

  const displayResult = () => {
    if (loading) {
      return (
        <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-8">
          LOADING...
        </div>
      );
    }
    
    if (error || !gameResult) {
      return (
        <div className="text-4xl md:text-5xl font-bold text-red-400 mb-8">
          ERROR
        </div>
      );
    }
    
    return (
      <>
        <div className={`text-8xl md:text-9xl font-bold mb-8 ${
          gameResult.didWin ? 'text-green-400' : 'text-red-400'
        }`}>
          {gameResult.didWin ? 'YES' : 'NO'}
        </div>
        
        <div className="text-xl md:text-2xl mb-16">
          <p>{gameResult.gameInfo}</p>
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
          <p>Last refresh: {new Date().toLocaleString()}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
