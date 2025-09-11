export interface Raffle {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: 'active' | 'completed' | 'processed';
  created_by: number;
  created_by_name: string;
  winner?: number;
  winner_name?: string;
  winner_email?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  progress_percentage: number;
  total_participations: number;
  is_completed: boolean;
}

export interface RaffleParticipation {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  raffle: number;
  raffle_title: string;
  coins_amount: number;
  created_at: string;
}

export interface CreateRaffleData {
  title: string;
  description: string;
  target_amount: number;
}

export interface ParticipateRaffleData {
  raffle: number;
  coins_amount: number;
}

