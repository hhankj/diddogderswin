#!/usr/bin/env node

// Schedule this script to run every 30 minutes during baseball season
// Usage: node scripts/check-games.js
// Or with cron: */30 * * * * node /path/to/scripts/check-games.js

import fs from 'fs';
import path from 'path';

async function checkDodgersGame() {
  try {
    console.log('🔍 Checking Dodgers game results...');
    
    // Example: Check ESPN API or MLB API
    // Replace with actual API call
    const gameData = await fetchLatestDodgersGame();
    
    if (!gameData) {
      console.log('❌ No recent games found');
      return;
    }

    // Check if it's a new home win
    const gameDataPath = path.join(process.cwd(), 'public', 'game-data.json');
    const currentData = JSON.parse(fs.readFileSync(gameDataPath, 'utf-8'));
    
    // If this is a new win (different from last recorded win)
    if (gameData.didWin && gameData.isHome && gameData.gameId !== currentData.lastGameId) {
      console.log('🎉 NEW DODGERS HOME WIN DETECTED!');
      console.log(`🆚 Game: ${gameData.gameInfo}`);
      
      // FIRST: Update game data to prevent duplicate processing
      const newGameData = {
        didWin: true,
        gameInfo: gameData.gameInfo,
        lastUpdated: new Date().toISOString(),
        lastGameId: gameData.gameId, // This prevents duplicate emails
        lastHomeWin: new Date().toISOString(),
        emailSent: false // Track if email was successfully sent
      };
      
      fs.writeFileSync(gameDataPath, JSON.stringify(newGameData, null, 2));
      console.log('💾 Game data saved, preventing duplicate processing');
      
      // SECOND: Send emails
      try {
        const response = await fetch('http://localhost:3000/api/send-win-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameInfo: gameData.gameInfo })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Mark email as successfully sent
          newGameData.emailSent = true;
          newGameData.emailsSent = result.emailsSent;
          fs.writeFileSync(gameDataPath, JSON.stringify(newGameData, null, 2));
          
          console.log('✅ SUCCESS: Sent emails to', result.emailsSent, 'subscribers');
        } else {
          console.log('❌ FAILED: Email sending failed:', result.error);
        }
        
      } catch (emailError) {
        console.error('❌ ERROR: Failed to send emails:', emailError);
      }
      
    } else if (gameData.didWin && gameData.isHome) {
      console.log('ℹ️  Already processed this home win (gameId:', gameData.gameId, ')');
    } else {
      console.log('ℹ️  No new home wins to process');
    }
    
  } catch (error) {
    console.error('❌ Error checking games:', error);
  }
}

// Mock function - replace with actual API integration
async function fetchLatestDodgersGame() {
  // Example API calls you could make:
  
  // Option 1: ESPN API
  // const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/119/schedule');
  
  // Option 2: MLB Stats API  
  // const response = await fetch('https://statsapi.mlb.com/api/v1/teams/119/stats');
  
  // Option 3: Sports API service
  // const response = await fetch(`https://api.sportsdata.io/v3/mlb/scores/json/GamesByDate/${today}`);
  
  // For now, return mock data
  return {
    didWin: true,
    isHome: true,
    gameId: 'LAD-2024-001',
    gameInfo: 'Dodgers defeated Giants 7-4 at Dodger Stadium!',
    opponent: 'Giants',
    score: '7-4'
  };
}

// Run the check
checkDodgersGame(); 