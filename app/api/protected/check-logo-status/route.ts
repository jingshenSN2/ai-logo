import { respData, respErr } from "@/lib/resp";

import { currentUser } from "@clerk/nextjs";
import { getLogo } from "@/models/user_logo";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return respErr("no auth");
  }

  try {
    const { logo_id } = await req.json();
    if (!logo_id) {
      return respErr("invalid params");
    }

    const user_id = user.id;
    const logo = await getLogo(user_id, logo_id);

    return respData(logo);
  } catch (e) {
    console.log("check logo status failed: ", e);
    return respErr("check logo status failed");
  }
}
