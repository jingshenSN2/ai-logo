import fs from "fs";
import path from "path";
import { Readable } from "stream";

import AWS from "aws-sdk";
import axios from "axios";
import sharp from "sharp";

AWS.config.update({
  accessKeyId: process.env.AWS_AK,
  secretAccessKey: process.env.AWS_SK,
  // region: 'your-region' // 请确保替换为实际的AWS区域
});

const tshirt = "white_t.jpg";
const tshirtImage = Buffer.from(
  fs.readFileSync(path.resolve(process.cwd(), "public", tshirt))
);

const s3 = new AWS.S3();

async function fetchImageStream(imageUrl: string): Promise<Readable> {
  try {
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch image from ${imageUrl}`, error);
    throw error;
  }
}

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
    const metadata = await sharp(imageBuffer).metadata();
    return { imageBuffer, metadata };
  } catch (error) {
    console.error(`Failed to fetch image and metadata from ${url}`, error);
    throw error;
  }
}

export async function processAndUploadImage(
  imageUrl: string,
  localImagePath: string,
  bucketName: string,
  s3Key: string
) {
  try {
    // 下载生成的图像及其元数据
    const { imageBuffer, metadata: downloadedImageMetadata } =
      await fetchImageAndMetadata(imageUrl);
    if (!imageBuffer) {
      throw new Error("Failed to convert image stream to buffer");
    }

    // 读取本地图像
    const localImage = sharp(tshirtImage);
    const localMetadata = await localImage.metadata();
    const { width: localWidth, height: localHeight } = localMetadata;
    if (localWidth === undefined || localHeight === undefined) {
      throw new Error("Failed to get local image dimensions");
    }

    const { width: downloadedWidth, height: downloadedHeight } =
      downloadedImageMetadata;
    if (downloadedWidth === undefined || downloadedHeight === undefined) {
      throw new Error("Failed to get downloaded image dimensions");
    }

    console.log("Local image metadata:", { localWidth, localHeight });
    console.log("Downloaded image metadata:", {
      downloadedWidth,
      downloadedHeight,
    });

    // 将生成的图像覆盖在本地图像上，确保正中间
    const overlaidImage = await localImage
      .composite([
        {
          input: imageBuffer,
          top: Math.round((localHeight - downloadedHeight) / 2),
          left: Math.round((localWidth - downloadedWidth) / 2),
        },
      ])
      .toBuffer();

    // 上传合成后的图像到 S3
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: overlaidImage,
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    console.log("Image uploaded successfully:", uploadResult);
    return uploadResult;
  } catch (error) {
    console.error("Failed to process and upload image:", error);
    throw error;
  }
}

export async function downloadAndUploadImage(
  imageUrl: string,
  bucketName: string,
  s3Key: string
) {
  try {
    const imageStream = await fetchImageStream(imageUrl);

    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: imageStream,
    };

    return s3.upload(uploadParams).promise();
  } catch (error) {
    console.error("Failed to download and upload image:", error);
    throw error;
  }
}

export async function downloadImage(imageUrl: string, outputPath: string) {
  try {
    const imageStream = await fetchImageStream(imageUrl);

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      imageStream.pipe(writer);

      let error: Error | null = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });

      writer.on("close", () => {
        if (!error) {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error("Failed to download image:", error);
    throw error;
  }
}
