import { respData, respErr } from "@/lib/resp";
import { v4 } from "uuid";

import { ImageGenerateParams } from "openai/resources/images.mjs";
import { User } from "@/types/user";
import { Logo } from "@/types/logo";
import { currentUser } from "@clerk/nextjs";
import { downloadAndUploadImage } from "@/lib/s3";
import { getOpenAIClient } from "@/services/openai";
import { getUserCredits } from "@/services/order";
import { insertLogo } from "@/models/logo";
import { saveUser } from "@/services/user";
import { findUserByEmail } from "@/models/user";

export async function POST(req: Request) {
  const client = getOpenAIClient();

  const user = await currentUser();
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return respErr("no auth");
  }

  try {
    const { description, llm_name, img_size, quality, style } =
      await req.json();
    if (!description) {
      return respErr("invalid params");
    }

    // save user
    const user_id = user.id;
    const user_email = user.emailAddresses[0].emailAddress;
    const nickname = user.firstName;
    const avatarUrl = user.imageUrl;
    const userInfo: User = {
      id: user_id,
      email: user_email,
      nickname: nickname || "",
      avatar_url: avatarUrl,
    };

    await saveUser(userInfo);

    const db_user = await findUserByEmail(user_email);
    const user_credits = await getUserCredits(user_email);

    if (
      !db_user?.super_user &&
      (!user_credits || user_credits.left_credits < 1)
    ) {
      return respErr("credits not enough");
    }

    const llm_params: ImageGenerateParams = {
      prompt: `A logo about ${description}`,
      model: llm_name || "dall-e-3",
      n: 1,
      quality: quality || "hd",
      response_format: "url",
      size: img_size || "1792x1024",
      style: style || "vivid",
    };
    const created_at = new Date().toISOString();

    const res = await client.images.generate(llm_params);

    const raw_img_url = res.data[0].url;
    if (!raw_img_url) {
      return respErr("generate logo failed");
    }

    const uuid = v4();
    const img_name = `${uuid}-${created_at}`;
    const s3_img = await downloadAndUploadImage(
      raw_img_url,
      process.env.S3_BUCKET || "aitist-ailogo-bucket",
      `logos/${img_name}.png`
    );
    const img_url = s3_img.Location;

    const logo: Logo = {
      id: img_name,
      user_email: user_email,
      img_description: description,
      img_size: img_size || "1792x1024",
      img_url: img_url,
      llm_name: llm_name,
      llm_params: JSON.stringify(llm_params),
      created_at: created_at,
      created_user: userInfo,
    };
    await insertLogo(logo);

    return respData(logo);
  } catch (e) {
    console.log("generate logo failed: ", e);
    return respErr("generate logo failed");
  }
}
