-- Create the game_data table
CREATE TABLE IF NOT EXISTS game_data (
  id SERIAL PRIMARY KEY,
  did_win BOOLEAN NOT NULL,
  game_info TEXT NOT NULL,
  game_id TEXT UNIQUE NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
  last_home_win TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT FALSE,
  emails_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  game_id TEXT NOT NULL,
  subscriber_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed')) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_data_game_id ON game_data(game_id);
CREATE INDEX IF NOT EXISTS idx_game_data_created_at ON game_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(active);
CREATE INDEX IF NOT EXISTS idx_email_logs_game_id ON email_logs(game_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber_email ON email_logs(subscriber_email);

-- Create a function to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update last_updated on game_data updates
CREATE TRIGGER update_game_data_last_updated
    BEFORE UPDATE ON game_data
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
-- Allow public read access to game_data
CREATE POLICY "Allow public read access to game_data" ON game_data
    FOR SELECT USING (true);

-- Allow public insert/update access to game_data (for your app to update)
CREATE POLICY "Allow public write access to game_data" ON game_data
    FOR ALL USING (true);

-- Allow public read/write access to subscribers
CREATE POLICY "Allow public access to subscribers" ON subscribers
    FOR ALL USING (true);

-- Allow public write access to email_logs
CREATE POLICY "Allow public write access to email_logs" ON email_logs
    FOR INSERT WITH CHECK (true);

-- Allow public read access to email_logs
CREATE POLICY "Allow public read access to email_logs" ON email_logs
    FOR SELECT USING (true); 