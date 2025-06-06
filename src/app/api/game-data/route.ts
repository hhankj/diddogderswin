import { NextResponse } from 'next/server';
import { getLatestGameData } from '@/lib/database';

export async function GET() {
  try {
    const gameData = await getLatestGameData();

    if (!gameData) {
      return NextResponse.json({
        didWin: false,
        gameInfo: 'No recent game data available',
        lastUpdated: new Date().toISOString(),
        error: 'No game data found'
      });
    }

    // Transform the database response to match the expected format
    return NextResponse.json({
      didWin: gameData.did_win,
      gameInfo: gameData.game_info,
      lastUpdated: gameData.last_updated,
      lastHomeWin: gameData.last_home_win,
      emailSent: gameData.email_sent,
      emailsSent: gameData.emails_sent
    });

  } catch (error) {
    console.error('Error fetching game data:', error);
    return NextResponse.json(
      {
        didWin: false,
        gameInfo: 'Error loading game data',
        lastUpdated: new Date().toISOString(),
        error: 'Failed to fetch game data'
      },
      { status: 500 }
    );
  }
} 