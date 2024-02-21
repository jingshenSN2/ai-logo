export interface Order {
  id: string;
  user_id: string;
  created_at: string;
  amount: number;
  expired_at: string;
  order_status: number;
  paied_at?: string;
  stripe_session_id?: string;
  credits: number;
}
