import { findUser, insertUser } from "@/models/user_logo";

import { User } from "@/types/user";

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
