import { ImageGenerateParams } from "openai/resources/images.mjs";
import { v4 } from "uuid";

import { processAndUploadImage } from "@/lib/image";
import { promptFormatter } from "@/lib/prompt";
import { respData, respErr } from "@/lib/resp";
import {
  findUser,
  getUserCredits,
  insertLogo,
  updateLogo,
} from "@/models/user_logo";
import { getOpenAIClient } from "@/services/openai";
import { saveUser } from "@/services/user";
import { Logo } from "@/types/logo";
import { User } from "@/types/user";
import { currentUser } from "@clerk/nextjs";

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

    // Save user
    const user_id = user.id;
    const user_email = user.emailAddresses[0].emailAddress;
    const nickname = user.firstName;
    const avatarUrl = user.imageUrl;
    const userInfo: User = {
      id: user_id,
      email: user_email,
      nickname: nickname || "",
      avatar_url: avatarUrl,
      logos: [],
    };

    await saveUser(userInfo);

    const db_user = await findUser(user_id);
    const user_credits = await getUserCredits(user_id);

    if (
      !db_user?.super_user &&
      (!user_credits || user_credits.left_credits < 1)
    ) {
      return respErr("credits not enough");
    }

    const llm_params: ImageGenerateParams = {
      prompt: promptFormatter(description),
      model: llm_name || "dall-e-3",
      n: 1,
      quality: quality || "hd",
      response_format: "url",
      size: img_size || "540x480",
      style: style || "vivid",
    };
    const created_at = new Date().toISOString();

    // Create logo obj and save to db
    const uuid = v4();
    const img_path = `logos/${uuid}.png`;
    const img_url = `${
      process.env.S3_CLOUDFRONT_URL || "https://d3flt886hm4b5c.cloudfront.net"
    }/${img_path}`;
    const logo: Logo = {
      id: uuid,
      user_email: user_email,
      img_description: description,
      img_size: img_size || "540x480",
      img_quality: quality || "hd",
      img_style: style || "vivid",
      img_url: img_url,
      llm_name: llm_name,
      created_at: created_at,
      created_user_avatar_url: avatarUrl,
      created_user_nickname: nickname || "",
      status: "generating",
    };
    await insertLogo(user_id, logo);

    client.images.generate(llm_params).then(async (res) => {
      console.log("generate logo res: ", res);
      const raw_img_url = res.data[0].url;
      if (!raw_img_url) {
        return respErr("generate logo failed");
      }
      console.log("img_path: ", img_path);

      try {
        await processAndUploadImage(
          raw_img_url,
          process.env.S3_BUCKET || "aitist-ailogo-bucket",
          img_path
        );
        console.log("Image processed and uploaded successfully");
        logo.status = "success";
      } catch (error) {
        console.error("Failed to process and upload image", error);
        logo.status = "failed";
      }

      // Update logo obj and save to db
      await updateLogo(user_id, uuid, { status: logo.status });

      // Update user info and save
      userInfo.logos.push(logo);
      await saveUser(userInfo);
    });

    // Return immediately before image is generated
    return respData(logo);
  } catch (e) {
    console.log("generate logo failed: ", e);
    return respErr("generate logo failed");
  }
}
