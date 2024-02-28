import { respData, respErr } from "@/lib/resp";

import { ImageGenerateParams } from "openai/resources/images.mjs";
import { currentUser } from "@clerk/nextjs";
import { downloadAndUploadImage } from "@/lib/s3";
import { getOpenAIClient } from "@/services/openai";

import { getLogo, updateLogo } from "@/models/user_logo";

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
      prompt: `A logo about ${logo.img_description}`,
      model: logo.llm_name,
      n: 1,
      quality: logo.img_quality,
      response_format: "url",
      size: logo.img_size,
      style: logo.img_style,
    };

    client.images.generate(llm_params).then(async (res) => {
      const raw_img_url = res.data[0].url;
      if (!raw_img_url) {
        return respErr("generate logo failed");
      }
      const img_path = `logos/${logo_id}.png`;
      const _ = await downloadAndUploadImage(
        raw_img_url,
        process.env.S3_BUCKET || "aitist-ailogo-bucket",
        img_path
      );
      const img_url = `${
        process.env.S3_CLOUDFRONT_URL || "https://d3flt886hm4b5c.cloudfront.net"
      }/${img_path}`;

      // update logo obj and save to db
      updateLogo(user_id, logo_id, { img_url, generating: false });
    });

    // return immediately before image is generated
    return respData(logo);
  } catch (e) {
    console.log("generate logo failed: ", e);
    return respErr("generate logo failed");
  }
}
