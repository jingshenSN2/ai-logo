import { ImageGenerateParams } from "openai/resources/images.mjs";
import { v4 } from "uuid";

import { processAndUploadImage } from "@/lib/image";
import { promptFormatter } from "@/lib/prompt";
import { respData, respErr } from "@/lib/resp";
import { getUserCredits, updateOrInsertLogo } from "@/models/user_logo";
import { getOpenAIClient } from "@/services/openai";
import { getOrSaveUser } from "@/services/user";
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
    // Get params from request
    const { description, llm_name, img_size, quality, style, logo_id } =
      await req.json();
    if (!logo_id && !description) {
      // If no logo_id, then it's new generation task, description is required
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

    const db_user = await getOrSaveUser(userInfo);
    const user_credits = await getUserCredits(user_id);

    if (
      !db_user?.super_user &&
      (!user_credits || user_credits.left_credits < 1)
    ) {
      return respErr("credits not enough");
    }

    const created_at = new Date().toISOString();

    const existLogo = db_user.logos.find((l) => l.id === logo_id);

    const logo: Logo = existLogo || {
      id: v4(), // Generate new logo id
      user_email: user_email,
      img_description: description,
      img_size: img_size || "540x480",
      img_quality: quality || "hd",
      img_style: style || "vivid",
      img_url: "",
      llm_name: llm_name,
      created_at: created_at,
      created_user_avatar_url: avatarUrl,
      created_user_nickname: nickname || "",
      status: "generating",
    };

    const img_path = `logos/${logo.id}.png`;

    logo.status = "generating";
    logo.created_at = created_at;
    logo.img_url = `${
      process.env.S3_CLOUDFRONT_URL || "https://d3flt886hm4b5c.cloudfront.net"
    }/${img_path}`;

    const llm_params: ImageGenerateParams = {
      prompt: promptFormatter(logo.img_description),
      model: logo.llm_name,
      n: 1,
      quality: logo.img_quality,
      response_format: "url",
      size: logo.img_size,
      style: logo.img_style,
    };

    await updateOrInsertLogo(user_id, logo.id, logo);

    client.images.generate(llm_params).then(async (res) => {
      console.log("generate logo res: ", res);
      const raw_img_url = res.data[0].url;
      if (!raw_img_url) {
        return respErr("generate logo failed");
      }

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
      await updateOrInsertLogo(user_id, logo.id, logo);
    });

    // Return immediately before image is generated
    return respData(logo);
  } catch (e) {
    console.log("generate logo failed: ", e);
    return respErr("generate logo failed");
  }
}
