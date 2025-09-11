export interface Battle {
  id: number;
  title: string;
  description: string;
  influencer_a: number;
  influencer_a_name: string;
  influencer_a_email: string;
  influencer_b: number;
  influencer_b_name: string;
  influencer_b_email: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'active' | 'finished' | 'cancelled';
  total_coins_a: number;
  total_coins_b: number;
  total_coins: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  time_remaining: number;
  is_active: boolean;
}

export interface BattleBet {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  battle: number;
  battle_title: string;
  influencer_choice: 'a' | 'b';
  coins_amount: number;
  created_at: string;
}

export interface BattleResult {
  id: number;
  battle: Battle;
  battle_title: string;
  winner: number;
  winner_name: string;
  winner_email: string;
  platform_profit: number;
  winner_profit: number;
  sorteo_profit: number;
  commission_a: number;
  commission_b: number;
  sorteo_winner: number | null;
  sorteo_winner_name: string | null;
  sorteo_winner_email: string | null;
  created_at: string;
}
