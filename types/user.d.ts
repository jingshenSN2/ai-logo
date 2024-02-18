export interface User {
  id?: string;
  email: string;
  nickname: string;
  avatar_url: string;
  created_at?: string;
  credits?: UserCredits;
  super_user?: boolean;
}

export interface UserCredits {
  one_time_credits: number;
  monthly_credits: number;
  total_credits: number;
  used_credits: number;
  left_credits: number;
}
