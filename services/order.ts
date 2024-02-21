import { getUserOrders, updateOrderStatus } from "@/models/order";

import { Order } from "@/types/order";
import Stripe from "stripe";
import { UserCredits } from "@/types/user";
import { getUserUsedCredit } from "@/models/user_logo";

export async function handleOrderSession(session_id: string) {
  const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || "");
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("order session: ", session);
    if (!session || !session.metadata || !session.metadata.order_no) {
      console.log("invalid session", session_id);
      throw new Error("invalid session");
    }

    const order_no = session.metadata.order_no;
    const paied_at = new Date().toISOString();
    updateOrderStatus(order_no, 2, paied_at);
    console.log("update success order status: ", order_no, paied_at);
  } catch (e) {
    console.log("handle order session failed: ", e);
    throw e;
  }
}

export async function getUserCredits(user_id: string): Promise<UserCredits> {
  let user_credits: UserCredits = {
    total_credits: 3,
    used_credits: 0,
    left_credits: 3,
  };

  try {
    const used_credits = await getUserUsedCredit(user_id);
    user_credits.used_credits = used_credits;

    const orders = await getUserOrders(user_id);

    orders?.forEach((order: Order) => {
      user_credits.total_credits += order.credits;
    });

    user_credits.left_credits =
      user_credits.total_credits - user_credits.used_credits;

    return user_credits;
  } catch (e) {
    console.log("get user credits failed: ", e);
    return user_credits;
  }
}
