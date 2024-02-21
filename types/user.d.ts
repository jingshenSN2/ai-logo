import { Logo } from "./logo";

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
  logos: Logo[];
  created_at?: string;
  credits?: UserCredits;
  super_user?: boolean;
}

export interface UserCredits {
  total_credits: number;
  used_credits: number;
  left_credits: number;
}
