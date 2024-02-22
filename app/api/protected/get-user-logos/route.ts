import { respData, respErr } from "@/lib/resp";

import { getUserLogos } from "@/models/user_logo";
import { currentUser } from "@clerk/nextjs";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return respErr("not login");
  }
  try {
    const res = await getUserLogos(user.id);
    return respData(res);
  } catch (e) {
    console.log("get logos failed: ", e);
    return respErr("get logos failed");
  }
}
