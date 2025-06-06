import { NextRequest, NextResponse } from 'next/server';
import { sendWinEmails } from '@/app/actions';
import { upsertGameData } from '@/lib/database';

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

    // Update game data in Supabase
    const gameId = `LAD-${new Date().getFullYear()}-${Date.now()}`;
    const gameInfo = data.gameInfo || `Dodgers beat ${data.opponent} ${data.score} at home!`;
    
    const gameData = await upsertGameData({
      did_win: true,
      game_info: gameInfo,
      game_id: gameId,
      last_updated: new Date().toISOString(),
      last_home_win: new Date().toISOString(),
      email_sent: false,
      emails_sent: 0
    });

    if (!gameData) {
      return NextResponse.json(
        { error: 'Failed to update game data' },
        { status: 500 }
      );
    }

    // Send emails to all subscribers
    const result = await sendWinEmails(gameData.game_info);

    return NextResponse.json({
      success: true,
      message: `Dodgers won at home! Sent emails to ${result.count} subscribers`,
      emailsSent: result.count,
      failed: result.failed || 0,
      gameInfo: gameData.game_info
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 