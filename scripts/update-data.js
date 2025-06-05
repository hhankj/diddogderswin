import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fetchDodgersRecentGames = async () => {
  try {
    // Using dynamic import for node-fetch since it's ES6 module
    const fetch = (await import('node-fetch')).default;
    
    // Fetch recent Dodgers games from ESPN API
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/19/schedule');
    
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    
    const data = await response.json();
    
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
    
    const gameDate = new Date(mostRecentGame.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const gameInfo = `on ${gameDate} against the ${opponent?.team.displayName || 'opponent'}`;
    
    return {
      didWin: dodgersCompetitor.winner,
      gameInfo,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error fetching Dodgers game data:', error);
    return {
      error: 'Failed to fetch game data',
      lastUpdated: new Date().toISOString()
    };
  }
};

const main = async () => {
  console.log('Fetching Dodgers game data...');
  
  const gameData = await fetchDodgersRecentGames();
  
  // Ensure public directory exists
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write data to JSON file
  const filePath = path.join(publicDir, 'game-data.json');
  fs.writeFileSync(filePath, JSON.stringify(gameData, null, 2));
  
  console.log('Game data updated successfully:', gameData);
};

main().catch(console.error); 