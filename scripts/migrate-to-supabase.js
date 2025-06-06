#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateGameData() {
  try {
    console.log('🔄 Starting migration to Supabase...');
    
    // Read existing game data
    const gameDataPath = path.join(__dirname, '..', 'public', 'game-data.json');
    
    if (!fs.existsSync(gameDataPath)) {
      console.log('ℹ️  No existing game-data.json found, skipping game data migration');
      return;
    }
    
    const gameDataRaw = fs.readFileSync(gameDataPath, 'utf-8');
    const gameData = JSON.parse(gameDataRaw);
    
    console.log('📄 Found existing game data:', gameData);
    
    // Transform and insert game data
    const gameRecord = {
      did_win: gameData.didWin || false,
      game_info: gameData.gameInfo || 'No game info available',
      game_id: gameData.lastGameId || `LAD-MIGRATED-${Date.now()}`,
      last_updated: gameData.lastUpdated || new Date().toISOString(),
      last_home_win: gameData.lastHomeWin || null,
      email_sent: gameData.emailSent || false,
      emails_sent: gameData.emailsSent || 0
    };
    
    const { data: insertedGame, error: gameError } = await supabase
      .from('game_data')
      .upsert([gameRecord], { onConflict: 'game_id' })
      .select();
    
    if (gameError) {
      console.error('❌ Error inserting game data:', gameError);
    } else {
      console.log('✅ Successfully migrated game data:', insertedGame);
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { error } = await supabase
      .from('game_data')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Migration Tool');
  console.log('==========================');
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to Supabase. Please check your configuration.');
    process.exit(1);
  }
  
  // Migrate game data
  await migrateGameData();
  
  console.log('');
  console.log('✅ Migration completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Verify your data in the Supabase dashboard');
  console.log('2. Update your environment variables in Vercel');
  console.log('3. Deploy your updated application');
  console.log('4. Test the email subscription and game data features');
}

main().catch(console.error); 