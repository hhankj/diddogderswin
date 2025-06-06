#!/usr/bin/env node

// GitHub Actions script to check Dodgers games and send emails via Supabase
// Runs every 5 minutes via GitHub Actions

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch real Dodgers game data from ESPN API
const fetchDodgersRecentGames = async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🔍 Fetching Dodgers games from ESPN API...');
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/19/schedule');
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Find the most recent completed home game
    const recentHomeGames = data.events
      .filter(event => {
        const competition = event.competitions[0];
        return competition.status.type.completed && 
               competition.venue.fullName === 'Dodger Stadium';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (recentHomeGames.length === 0) {
      console.log('ℹ️  No recent home games found');
      return null;
    }
    
    const mostRecentGame = recentHomeGames[0];
    const competition = mostRecentGame.competitions[0];
    
    // Find the Dodgers in the competitors array
    const dodgersCompetitor = competition.competitors.find(
      competitor => competitor.team.id === '19'
    );
    
    if (!dodgersCompetitor) {
      console.log('❌ Dodgers not found in game data');
      return null;
    }
    
    // Get opponent info
    const opponent = competition.competitors.find(
      competitor => competitor.team.id !== '19'
    );
    
    const gameDate = new Date(mostRecentGame.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Los_Angeles'
    });
    
    const gameInfo = `on ${gameDate} against the ${opponent?.team.displayName || 'opponent'}`;
    const gameId = `LAD-${mostRecentGame.id || Date.now()}`;
    
    return {
      didWin: dodgersCompetitor.winner,
      isHome: true,
      gameId,
      gameInfo,
      opponent: opponent?.team.displayName,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error fetching Dodgers game data:', error);
    return null;
  }
};

// Get latest game data from Supabase
const getLatestGameData = async () => {
  try {
    const { data, error } = await supabase
      .from('game_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching latest game data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching latest game data:', error);
    return null;
  }
};

// Update game data in Supabase
const upsertGameData = async (gameData) => {
  try {
    const { data, error } = await supabase
      .from('game_data')
      .upsert([gameData], { 
        onConflict: 'game_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting game data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error upserting game data:', error);
    return null;
  }
};

// Send emails via Vercel API endpoint
const sendWinEmails = async (gameInfo) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('📧 Triggering email sending...');
    
    // Call your Vercel API endpoint to send emails
    const response = await fetch('https://diddodgerswin.vercel.app/api/send-win-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameInfo })
    });
    
    if (!response.ok) {
      throw new Error(`Email API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    return { success: false, error: error.message };
  }
};

// Main function
const main = async () => {
  console.log('🚀 GitHub Actions: Checking Dodgers games...');
  console.log('⏰ Time:', new Date().toISOString());
  
  try {
    // Fetch latest game data
    const gameData = await fetchDodgersRecentGames();
    
    if (!gameData) {
      console.log('ℹ️  No game data available');
      return;
    }
    
    console.log('🎮 Game data:', gameData);
    
    // Check if this is a new home win
    const currentData = await getLatestGameData();
    
    if (gameData.didWin && gameData.isHome && gameData.gameId !== currentData?.game_id) {
      console.log('🎉 NEW DODGERS HOME WIN DETECTED!');
      console.log(`🆚 Game: ${gameData.gameInfo}`);
      
      // Update game data in Supabase
      const newGameData = await upsertGameData({
        did_win: true,
        game_info: gameData.gameInfo,
        game_id: gameData.gameId,
        last_updated: gameData.lastUpdated,
        last_home_win: gameData.lastUpdated,
        email_sent: false,
        emails_sent: 0
      });
      
      if (!newGameData) {
        console.error('❌ Failed to save game data');
        return;
      }
      
      console.log('💾 Game data saved to Supabase');
      
      // Send emails
      const emailResult = await sendWinEmails(gameData.gameInfo);
      
      if (emailResult.success) {
        // Update email sent status
        await upsertGameData({
          ...newGameData,
          email_sent: true,
          emails_sent: emailResult.emailsSent || 0
        });
        
        console.log(`✅ SUCCESS: Sent emails to ${emailResult.emailsSent} subscribers`);
      } else {
        console.log('❌ Email sending failed:', emailResult.error);
      }
      
    } else if (gameData.didWin && gameData.isHome) {
      console.log('ℹ️  Already processed this home win (gameId:', gameData.gameId, ')');
    } else if (!gameData.didWin) {
      console.log('😢 Dodgers did not win their last home game');
    } else {
      console.log('ℹ️  No new home wins to process');
    }
    
  } catch (error) {
    console.error('❌ GitHub Actions error:', error);
    process.exit(1);
  }
  
  console.log('✅ GitHub Actions completed successfully');
};

main(); 