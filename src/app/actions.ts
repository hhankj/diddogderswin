'use server';

import { addSubscriber, getActiveSubscribers } from '@/lib/database';
import { sendDodgersWinEmailToAll } from '@/lib/email';

// Server action to handle newsletter subscription
export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: 'Email is required' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }

  try {
    const result = addSubscriber(email);
    return result;
  } catch (error) {
    console.error('Error subscribing user:', error);
    return { success: false, message: 'Failed to subscribe. Please try again.' };
  }
}

// Server action to send win emails (you can call this manually or via API)
export async function sendWinEmails(gameInfo: string) {
  try {
    const subscribers = await getActiveSubscribers();
    
    if (subscribers.length === 0) {
      return { success: true, message: 'No subscribers to notify', count: 0 };
    }

    const result = await sendDodgersWinEmailToAll(subscribers, gameInfo);
    
    return {
      success: true,
      message: `Sent ${result.successful} emails, ${result.failed} failed`,
      count: result.successful,
      failed: result.failed
    };
  } catch (error) {
    console.error('Error sending win emails:', error);
    return { success: false, message: 'Failed to send emails' };
  }
}

// Test function to send a single email (for testing)
export async function testEmail(email: string) {
  console.log('testEmail called with:', email);
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  
  try {
    const { sendDodgersWinEmail } = await import('@/lib/email');
    console.log('About to call sendDodgersWinEmail');
    
    const result = await sendDodgersWinEmail(
      email,
      "Test email: The Dodgers defeated the Giants 8-3 in a thrilling home game!"
    );
    
    console.log('sendDodgersWinEmail result:', result);
    return result;
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error: 'Failed to send test email' };
  }
} 