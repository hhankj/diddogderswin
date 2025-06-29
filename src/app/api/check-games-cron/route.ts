import { NextRequest, NextResponse } from 'next/server';
import { sendWinEmails } from '@/app/actions';
import { getLatestGameData, upsertGameData } from '@/lib/database';

// This runs every 30 minutes via Vercel cron
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Vercel Cron: Checking Dodgers game results...');
    
    // Verify this is actually a cron request (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Mock game data - replace with real API call
    const gameData = await fetchLatestDodgersGame();
    
    if (!gameData) {
      console.log('❌ No recent games found');
      return NextResponse.json({ message: 'No games found' });
    }

    // Check if it's a new home win
    const currentData = await getLatestGameData();
    
    // If this is a new win (different from last recorded win)
    if (gameData.didWin && gameData.isHome && gameData.gameId !== currentData?.game_id) {
      console.log('🎉 NEW DODGERS HOME WIN DETECTED!');
      console.log(`🆚 Game: ${gameData.gameInfo}`);
      
      // Update game data to prevent duplicate processing
      const newGameData = await upsertGameData({
        did_win: true,
        game_info: gameData.gameInfo,
        game_id: gameData.gameId,
        last_updated: new Date().toISOString(),
        last_home_win: new Date().toISOString(),
        email_sent: false,
        emails_sent: 0
      });
      
      if (!newGameData) {
        console.error('❌ Failed to save game data');
        return NextResponse.json({ error: 'Failed to save game data' }, { status: 500 });
      }
      
      console.log('💾 Game data saved, preventing duplicate processing');
      
      // Send emails
      try {
        const result = await sendWinEmails(gameData.gameInfo);
        
        if (result.success) {
          // Update the email sent status
          await upsertGameData({
            ...newGameData,
            email_sent: true,
            emails_sent: result.count || 0
          });
          
          console.log('✅ SUCCESS: Sent emails to', result.count, 'subscribers');
          
          return NextResponse.json({
            success: true,
            message: `Sent emails to ${result.count} subscribers`,
            gameInfo: gameData.gameInfo
          });
        } else {
          console.log('❌ FAILED: Email sending failed:', result.message);
          return NextResponse.json({ error: result.message }, { status: 500 });
        }
        
      } catch (emailError) {
        console.error('❌ ERROR: Failed to send emails:', emailError);
        return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
      }
      
    } else if (gameData.didWin && gameData.isHome) {
      console.log('ℹ️  Already processed this home win (gameId:', gameData.gameId, ')');
      return NextResponse.json({ message: 'Already processed this win' });
    } else {
      console.log('ℹ️  No new home wins to process');
      return NextResponse.json({ message: 'No new home wins' });
    }
    
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}

// Mock function - replace with actual MLB API integration
async function fetchLatestDodgersGame() {
  // For testing, return mock data
  return {
    didWin: true,
    isHome: true,
    gameId: 'LAD-2024-12-19',
    gameInfo: 'Dodgers defeated Giants 7-4 at Dodger Stadium!',
    opponent: 'Giants',
    score: '7-4'
  };
} 