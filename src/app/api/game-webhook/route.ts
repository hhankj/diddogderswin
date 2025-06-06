import { NextRequest, NextResponse } from 'next/server';
import { sendWinEmails } from '@/app/actions';
import fs from 'fs';
import path from 'path';

interface GameWebhookData {
  team: string;
  opponent: string;
  homeTeam: string;
  awayTeam: string;
  winner: string;
  score: string;
  gameInfo: string;
  isHome: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Optional: Add webhook security
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const data: GameWebhookData = await request.json();
    
    // Check if Dodgers won at home
    const isDodgersHomeWin = 
      data.team.toLowerCase().includes('dodgers') && 
      data.winner.toLowerCase().includes('dodgers') && 
      data.isHome === true;

    if (!isDodgersHomeWin) {
      return NextResponse.json({ 
        message: 'Not a Dodgers home win, no emails sent',
        processed: false 
      });
    }

    // Update game data file
    const gameDataPath = path.join(process.cwd(), 'public', 'game-data.json');
    const gameData = {
      didWin: true,
      gameInfo: data.gameInfo || `Dodgers beat ${data.opponent} ${data.score} at home!`,
      lastUpdated: new Date().toISOString(),
      lastHomeWin: new Date().toISOString()
    };
    
    fs.writeFileSync(gameDataPath, JSON.stringify(gameData, null, 2));

    // Send emails to all subscribers
    const result = await sendWinEmails(gameData.gameInfo);

    return NextResponse.json({
      success: true,
      message: `Dodgers won at home! Sent emails to ${result.count} subscribers`,
      emailsSent: result.count,
      failed: result.failed || 0,
      gameInfo: gameData.gameInfo
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 