import { respData, respErr } from "@/lib/resp";

import { getLogos } from "@/models/logo";

export async function POST(req: Request) {
  try {
    const { page } = await req.json();
    const logos = await getLogos(page || 1, 100);

    return respData(logos);
  } catch (e) {
    console.log("get logos failed: ", e);
    return respErr("get logos failed");
  }
}
