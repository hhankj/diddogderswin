import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export interface GameData {
  id?: number
  did_win: boolean
  game_info: string
  game_id: string
  last_updated: string
  last_home_win?: string
  email_sent: boolean
  emails_sent: number
  created_at?: string
}

export interface Subscriber {
  id?: number
  email: string
  subscribed_at: string
  active: boolean
  created_at?: string
}

export interface EmailLog {
  id?: number
  game_id: string
  subscriber_email: string
  sent_at: string
  status: 'sent' | 'failed'
  error_message?: string
  created_at?: string
} 