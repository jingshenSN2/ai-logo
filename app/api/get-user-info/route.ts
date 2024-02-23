import { respData, respErr } from "@/lib/resp";

import { User } from "@/types/user";
import { currentUser } from "@clerk/nextjs";
import { getUserCredits, saveUser } from "@/services/user";
import { findUser } from "@/models/user_logo";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return respErr("not login");
  }

  try {
    const id = user.id;
    const email = user.emailAddresses[0].emailAddress;
    const nickname = user.firstName || user.lastName || "";
    const avatarUrl = user.imageUrl;
    const userInfo: User = {
      id: id,
      email: email,
      nickname: nickname,
      avatar_url: avatarUrl,
      logos: [],
    };

    await saveUser(userInfo);

    const db_user = await findUser(id);
    userInfo.super_user = db_user?.super_user || false;

    const user_credits = await getUserCredits(id);
    userInfo.credits = user_credits;

    return respData(userInfo);
  } catch (e) {
    console.log("get user info failed");
    return respErr("get user info failed");
  }
}
