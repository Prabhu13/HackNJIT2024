// This file contains type definitions for the PYALA battle application database schema
// These types define the shape of the data and specify the data types for each property
// While these are manually defined, they could be auto-generated using tools like Prisma

export type User = {
    id: string;
    username: string;
    password_hash: string;
    profile_pic_url: string;
    display_name: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
  };
  
  export type BattleSession = {
    id: string;
    host_user_id: string;
    session_code: string;
    is_active: boolean;
    max_players: number;
    current_players: number;
    battle_theme: string | null;
    time_limit: number;
    created_at: string;
    updated_at: string;
  };
  
  export type BattlePrompt = {
    id: string;
    session_id: string;
    user_id: string;
    prompt_text: string;
    player_position: number;
    created_at: string;
  };
  
  export type GeneratedImage = {
    id: string;
    prompt_id: string;
    image_url: string;
    thumbnail_url: string | null;
    generation_status: 'pending' | 'completed' | 'failed';
    created_at: string;
  };
  
  export type BattleResult = {
    id: string;
    session_id: string;
    winner_prompt_id: string;
    winner_votes: number;
    total_votes: number;
    created_at: string;
  };
  
  // Formatted types for display purposes
  export type FormattedBattleSession = Omit<BattleSession, 'created_at' | 'updated_at'> & {
    created_at: string;
    updated_at: string;
    host_username: string;
  };
  
  export type FormattedBattleResult = Omit<BattleResult, 'created_at'> & {
    created_at: string;
    winning_prompt: string;
    winner_username: string;
    win_percentage: string;
  };
  
  // Form submission types
  export type UserForm = {
    username: string;
    password_hash: string;
    display_name?: string;
    bio?: string;
  };
  
  export type BattleSessionForm = {
    max_players: number;
    battle_theme?: string;
    time_limit: number;
  };
  
  export type BattlePromptForm = {
    session_id: string;
    prompt_text: string;
    player_position: number;
  };
  
  // Raw database return types
  export type BattleResultRaw = Omit<BattleResult, 'winner_votes' | 'total_votes'> & {
    winner_votes: number;
    total_votes: number;
  };
  
  export type BattleSessionWithStats = BattleSession & {
    total_prompts: number;
    total_images: number;
    participants: number;
  };