import { respData, respErr } from "@/lib/resp";
import { toggleLogoPublicity } from "@/models/public_logo";
import { getLogo } from "@/models/user_logo";

import { currentUser } from "@clerk/nextjs";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return respErr("not login");
  }
  try {
    const user_id = user.id;
    // Get the logo_id and operation from the request body
    const { logo_id } = await req.json();
    if (!logo_id) {
      return respErr("invalid params");
    }

    // Check if the user has permission to update the logo
    const logo = await getLogo(user_id, logo_id);
    if (!logo) {
      return respErr("no permission");
    }

    // Update the logo
    const res = await toggleLogoPublicity(logo);

    return respData({ new_state: res });
  } catch (e) {
    console.log("update logo failed: ", e);
    return respErr("update logo failed");
  }
}
