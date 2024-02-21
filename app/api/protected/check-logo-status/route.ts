import { respData, respErr } from "@/lib/resp";
import { v4 } from "uuid";

import { ImageGenerateParams } from "openai/resources/images.mjs";
import { User } from "@/types/user";
import { Logo } from "@/types/logo";
import { currentUser } from "@clerk/nextjs";
import { downloadAndUploadImage } from "@/lib/s3";
import { getOpenAIClient } from "@/services/openai";
import { getUserCredits } from "@/services/order";
import { saveUser } from "@/services/user";
import { findUser, getLogo, insertLogo, updateLogo } from "@/models/user_logo";

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
