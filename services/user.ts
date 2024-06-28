import { findUser, insertUser } from "@/models/user_logo";
import { User } from "@/types/user";

export async function getOrSaveUser(user: User): Promise<User> {
  try {
    let existUser = await findUser(user.id);
    if (!existUser) {
      await insertUser(user);
      existUser = await findUser(user.id);
      if (!existUser) {
        throw new Error("save user failed");
      }
    }
    return existUser;
  } catch (e) {
    throw new Error("get or save user failed");
  }
}
