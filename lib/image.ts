import { Readable } from "stream";

import axios from "axios";
import sharp from "sharp";

import { uploadToS3 } from "./s3";

const tshirtUrls = {
  black: "https://d3flt886hm4b5c.cloudfront.net/tshirts/black_t.jpg",
  grey: "https://d3flt886hm4b5c.cloudfront.net/tshirts/grey_t.jpg",
  white: "https://d3flt886hm4b5c.cloudfront.net/tshirts/white_t.jpg",
};
const tshirtCache: Record<string, sharp.Sharp> = {};

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

async function fetchImageAndMetadata(url: string) {
  try {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });
    const imageBuffer = await streamToBuffer(response.data);
    const sharpImage = await sharp(imageBuffer);
    const metadata = await sharpImage.metadata();
    return { imageBuffer, sharpImage, metadata };
  } catch (error) {
    console.error(`Failed to fetch image and metadata from ${url}`, error);
    throw error;
  }
}

async function processOneAndUploadImage(
  tshirtColor: "black" | "grey" | "white",
  imageUrl: string,
  bucketName: string,
  s3Key: string
) {
  // Read tshirt image from cache or fetch from server
  let Tshirt = tshirtCache[tshirtColor];
  if (!Tshirt) {
    const tshirt = await fetchImageAndMetadata(tshirtUrls[tshirtColor]);
    Tshirt = tshirt.sharpImage;
  }

  const tshirtMetadata = await Tshirt.metadata();
  const { width: tshirtWidth, height: tshirtHeight } = tshirtMetadata;
  if (tshirtWidth === undefined || tshirtHeight === undefined) {
    throw new Error("Failed to get tshirt image dimensions");
  }

  // Download and process the image
  const { imageBuffer, metadata } = await fetchImageAndMetadata(imageUrl);
  const { width: downloadedWidth, height: downloadedHeight } = metadata;
  if (downloadedWidth === undefined || downloadedHeight === undefined) {
    throw new Error("Failed to get downloaded image dimensions");
  }

  console.log("Local image metadata:", { tshirtWidth, tshirtHeight });
  console.log("Downloaded image metadata:", {
    downloadedWidth,
    downloadedHeight,
  });

  // 将生成的图像覆盖在Tshirt图像上，确保正中间
  const overlaidImage = await Tshirt.composite([
    {
      input: imageBuffer,
      top: Math.round((tshirtHeight - downloadedHeight) / 2),
      left: Math.round((tshirtWidth - downloadedWidth) / 2),
    },
  ]).toBuffer();

  const uploadResult = await uploadToS3(overlaidImage, bucketName, s3Key);
  console.log("Image uploaded successfully:", uploadResult);
  return uploadResult;
}

export async function processAndUploadImage(
  imageUrl: string,
  bucketName: string,
  s3Key: string
) {
  // Download original image and upload to S3
  const { imageBuffer } = await fetchImageAndMetadata(imageUrl);
  await uploadToS3(imageBuffer, bucketName, s3Key);

  // Process and upload image on different tshirt colors
  await Promise.all([
    processOneAndUploadImage(
      "black",
      imageUrl,
      bucketName,
      s3Key.replace(".png", "_black.png")
    ),
    processOneAndUploadImage(
      "grey",
      imageUrl,
      bucketName,
      s3Key.replace(".png", "_grey.png")
    ),
    processOneAndUploadImage(
      "white",
      imageUrl,
      bucketName,
      s3Key.replace(".png", "_white.png")
    ),
  ]);
}
