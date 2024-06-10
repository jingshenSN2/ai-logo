import { User } from "./user";

export type ImageQuality = "hd" | "standard";
export type ImageSize =
  | "1792x1024"
  | "1024x1792"
  | "1024x1024"
  | "512x512"
  | "256x256";
export type ImageStyle = "vivid" | "natural";
export type LlmName = "dall-e-3" | "dall-e-2";

export interface Logo {
  id: string;
  user_email: string;
  img_description: string;
  img_size: ImageSize;
  img_quality: ImageQuality;
  img_style: ImageStyle;
  llm_name: LlmName;
  img_url: string;
  generating: boolean;
  created_at: string;
  created_user_avatar_url: string;
  created_user_nickname: string;
  generating: boolean;
  status: "generating" | "success" | "failed";
}
