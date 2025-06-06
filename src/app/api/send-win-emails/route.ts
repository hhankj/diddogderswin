import { NextRequest, NextResponse } from 'next/server';
import { sendWinEmails } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    // You can add authentication here if needed
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.API_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { gameInfo } = body;

    if (!gameInfo) {
      return NextResponse.json(
        { error: 'gameInfo is required' },
        { status: 400 }
      );
    }

    const result = await sendWinEmails(gameInfo);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        emailsSent: result.count,
        failed: result.failed
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-win-emails API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check the current subscriber count
export async function GET() {
  try {
    const { getActiveSubscribers } = await import('@/lib/subscribers-edge');
    const subscribers = await getActiveSubscribers();
    
    return NextResponse.json({
      subscriberCount: subscribers.length,
      message: `${subscribers.length} active subscribers`
    });
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    return NextResponse.json(
      { error: 'Failed to get subscriber count' },
      { status: 500 }
    );
  }
} 