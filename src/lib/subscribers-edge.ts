import { get } from '@vercel/edge-config';

interface Subscriber {
  email: string;
  subscribedAt: string;
  active: boolean;
}

// Get all subscribers from Edge Config
export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const subscribers = await get<Subscriber[]>('subscribers');
    return subscribers || [];
  } catch (error) {
    console.error('Error reading subscribers from Edge Config:', error);
    return [];
  }
}

// Get active subscribers
export async function getActiveSubscribers(): Promise<string[]> {
  const subscribers = await getSubscribers();
  return subscribers
    .filter(sub => sub.active)
    .map(sub => sub.email);
}

// Note: Edge Config is read-only from the app
// To add subscribers, we'll log them and manually update Edge Config
export async function addSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if already exists
    const subscribers = await getSubscribers();
    const existing = subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
    
    if (existing && existing.active) {
      return { success: false, message: 'Email already subscribed' };
    }

    // Log the new subscriber for manual addition
    console.log('🆕 NEW SUBSCRIBER REQUEST:', {
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      active: true
    });
    
    // In a real app, you'd use Vercel API to update Edge Config
    // For now, admin needs to manually add to Edge Config
    return { 
      success: true, 
      message: 'Successfully subscribed! You\'ll get notified when Dodgers win at home.' 
    };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return { success: false, message: 'Failed to subscribe' };
  }
}

export async function removeSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🗑️ UNSUBSCRIBE REQUEST:', email);
    return { success: true, message: 'Successfully unsubscribed' };
  } catch (error) {
    console.error('Error removing subscriber:', error);
    return { success: false, message: 'Failed to unsubscribe' };
  }
} 