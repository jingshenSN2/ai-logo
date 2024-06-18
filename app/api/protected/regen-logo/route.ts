import { ImageGenerateParams } from "openai/resources/images.mjs";

import { processAndUploadImage } from "@/lib/image";
import { promptFormatter } from "@/lib/prompt";
import { respData, respErr } from "@/lib/resp";
import { getLogo, updateLogo } from "@/models/user_logo";
import { getOpenAIClient } from "@/services/openai";
import { currentUser } from "@clerk/nextjs";

export async function POST(req: Request) {
  const client = getOpenAIClient();

  const user = await currentUser();
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return respErr("no auth");
  }

  try {
    const { logo_id } = await req.json();
    const user_id = user.id;

    const logo = await getLogo(user_id, logo_id);
    if (!logo) {
      return respErr("logo not found");
    }

    const llm_params: ImageGenerateParams = {
      prompt: promptFormatter(logo.img_description),
      model: logo.llm_name,
      n: 1,
      quality: logo.img_quality,
      response_format: "url",
      size: logo.img_size,
      style: logo.img_style,
    };
    // update logo status to generating
    updateLogo(user_id, logo_id, { status: "generating" });

    client.images.generate(llm_params).then(async (res) => {
      console.log("re-generate logo res: ", res);
      const raw_img_url = res.data[0].url;
      if (!raw_img_url) {
        return respErr("generate logo failed");
      }
      const img_path = `logos/${logo_id}.png`;
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

      // update logo obj and save to db
      updateLogo(user_id, logo_id, { status: logo.status });
    });

    // return immediately before image is generated
    return respData(logo);
  } catch (e) {
    console.log("generate logo failed: ", e);
    return respErr("generate logo failed");
  }
}
