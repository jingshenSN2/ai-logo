import { findUser, insertUser } from "@/models/user_logo";

import { User, UserCredits } from "@/types/user";

export async function saveUser(user: User) {
  try {
    const existUser = await findUser(user.id);
    if (!existUser) {
      await insertUser(user);
    }
  } catch (e) {
    console.log("save user failed: ", e);
  }
}

export async function getUserCredits(user_id: string): Promise<UserCredits> {
  let user_credits: UserCredits = {
    total_credits: 10,
    used_credits: 0,
    left_credits: 0,
  };
  try {
    const user = await findUser(user_id);
    if (user) {
      user_credits.used_credits = user.logos.length;
      user_credits.left_credits =
        user_credits.total_credits - user_credits.used_credits;
    }
  } catch (e) {
    console.log("get user credits failed: ", e);
  }
  return user_credits;
}
