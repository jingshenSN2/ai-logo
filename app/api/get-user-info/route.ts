import { respData, respErr } from "@/lib/resp";
import { findUser, getUserCredits } from "@/models/user_logo";
import { getOrSaveUser } from "@/services/user";
import { User } from "@/types/user";
import { currentUser } from "@clerk/nextjs";

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

    const db_user = await getOrSaveUser(userInfo);
    userInfo.super_user = db_user?.super_user || false;

    const user_credits = await getUserCredits(id);
    userInfo.credits = user_credits;

    return respData(userInfo);
  } catch (e) {
    console.log("get user info failed");
    return respErr("get user info failed");
  }
}
