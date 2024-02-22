import { respData, respErr } from "@/lib/resp";

import { getPublicLogos } from "@/models/public_logo";

export async function POST(req: Request) {
  try {
    const res = await getPublicLogos();
    return respData(res);
  } catch (e) {
    console.log("get logos failed: ", e);
    return respErr("get logos failed");
  }
}
