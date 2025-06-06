import { Resend } from 'resend';
import DodgersWinEmail from '@/emails/DodgersWinEmail';
import { logEmailSent } from '@/lib/database';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDodgersWinEmail(
  to: string,
  gameInfo: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Dodgers Win Alert <onboarding@resend.dev>', // Using Resend's development domain
      to: [to],
      subject: 'Test Email from Hank',
      react: DodgersWinEmail({ testMessage: gameInfo }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error as Error };
  }
}

export async function sendDodgersWinEmailToAll(
  subscribers: string[],
  gameInfo: string,
  gameId?: string
) {
  const emailGameId = gameId || `LAD-${new Date().getFullYear()}-${Date.now()}`;
  
  const results = await Promise.allSettled(
    subscribers.map(async (email) => {
      const result = await sendDodgersWinEmail(email, gameInfo);
      
      // Log the email attempt to Supabase
      await logEmailSent(
        emailGameId,
        email,
        result.success ? 'sent' : 'failed',
        result.success ? undefined : String(result.error)
      );
      
      return result;
    })
  );

  const successful = results.filter(result => 
    result.status === 'fulfilled' && result.value.success
  ).length;

  const failed = results.length - successful;

  return {
    total: results.length,
    successful,
    failed,
    results
  };
} 