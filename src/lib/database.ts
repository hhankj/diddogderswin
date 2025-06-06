import { supabase, GameData, Subscriber, EmailLog } from './supabase'

// Game Data Operations
export async function getLatestGameData(): Promise<GameData | null> {
  try {
    const { data, error } = await supabase
      .from('game_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching game data:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching game data:', error)
    return null
  }
}

export async function upsertGameData(gameData: Omit<GameData, 'id' | 'created_at'>): Promise<GameData | null> {
  try {
    const { data, error } = await supabase
      .from('game_data')
      .upsert([gameData], { 
        onConflict: 'game_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting game data:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error upserting game data:', error)
    return null
  }
}

// Subscriber Operations
export async function getActiveSubscribers(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('active', true)

    if (error) {
      console.error('Error fetching subscribers:', error)
      return []
    }

    return data.map(sub => sub.email)
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all subscribers:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching all subscribers:', error)
    return []
  }
}

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if subscriber already exists
    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('email, active')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing subscriber:', checkError)
      return { success: false, message: 'Failed to check existing subscriber' }
    }

    if (existing) {
      if (existing.active) {
        return { success: false, message: 'Email already subscribed' }
      } else {
        // Reactivate existing subscriber
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ active: true, subscribed_at: new Date().toISOString() })
          .eq('email', email.toLowerCase())

        if (updateError) {
          console.error('Error reactivating subscriber:', updateError)
          return { success: false, message: 'Failed to reactivate subscription' }
        }

        return { success: true, message: 'Successfully reactivated subscription!' }
      }
    }

    // Add new subscriber
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert([{
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
        active: true
      }])

    if (insertError) {
      console.error('Error adding subscriber:', insertError)
      return { success: false, message: 'Failed to subscribe' }
    }

    return { success: true, message: 'Successfully subscribed! You\'ll get notified when Dodgers win at home.' }
  } catch (error) {
    console.error('Error adding subscriber:', error)
    return { success: false, message: 'Failed to subscribe' }
  }
}

export async function removeSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('subscribers')
      .update({ active: false })
      .eq('email', email.toLowerCase())

    if (error) {
      console.error('Error removing subscriber:', error)
      return { success: false, message: 'Failed to unsubscribe' }
    }

    return { success: true, message: 'Successfully unsubscribed' }
  } catch (error) {
    console.error('Error removing subscriber:', error)
    return { success: false, message: 'Failed to unsubscribe' }
  }
}

// Email Log Operations
export async function logEmailSent(gameId: string, subscriberEmail: string, status: 'sent' | 'failed', errorMessage?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('email_logs')
      .insert([{
        game_id: gameId,
        subscriber_email: subscriberEmail,
        sent_at: new Date().toISOString(),
        status,
        error_message: errorMessage
      }])

    if (error) {
      console.error('Error logging email:', error)
    }
  } catch (error) {
    console.error('Error logging email:', error)
  }
}

export async function getEmailLogsForGame(gameId: string): Promise<EmailLog[]> {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching email logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching email logs:', error)
    return []
  }
} 