import { respData, respErr } from "@/lib/resp";
import { getLogo, updateLogo } from "@/models/user_logo";
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

    // Check if the logo is timed out
    if (logo.status === "generating") {
      const now = new Date();
      const created = new Date(logo.created_at);
      const diff = now.getTime() - created.getTime();
      if (diff > 10 * 60 * 1000) {
        // 10 minutes timeout
        logo.status = "failed";
        await updateLogo(user_id, logo.id, { status: "failed" });
      }
    }

    return respData(logo);
  } catch (e) {
    console.log("check logo status failed: ", e);
    return respErr("check logo status failed");
  }
}
