import { respData, respErr } from "@/lib/resp";

import { currentUser } from "@clerk/nextjs";
import { getLogo, updateLogo } from "@/models/user_logo";

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

    if (!logo) {
      return respErr("logo not found");
    }

    // If logo is generating after 60s created, do something
    const created_at = new Date(logo.created_at).getTime();
    if (logo.generating && Date.now() - created_at > 60 * 1000) {
      updateLogo(user_id, logo.id, { img_url: "", generating: false });
      logo.generating = false;
    }

    return respData(logo);
  } catch (e) {
    console.log("check logo status failed: ", e);
    return respErr("check logo status failed");
  }
}
