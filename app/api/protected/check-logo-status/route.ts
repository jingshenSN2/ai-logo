import { respData, respErr } from "@/lib/resp";
import { getLogo, updateOrInsertLogo } from "@/models/user_logo";
import { currentUser } from "@clerk/nextjs";

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

    // Check if the logo generation is timeout
    const created_at = new Date(logo.created_at).getTime();
    const now = new Date().getTime();
    if (now - created_at > 10 * 60 * 1000) {
      // Update the logo status to failed after 10 minutes
      logo.status = "failed";
      await updateOrInsertLogo(user_id, logo_id, logo);
    }

    return respData(logo);
  } catch (e) {
    console.log("check logo status failed: ", e);
    return respErr("check logo status failed");
  }
}
