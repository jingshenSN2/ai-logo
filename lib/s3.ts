import fs from "fs";
import { Readable } from "stream";
import AWS from "aws-sdk";
import axios from "axios";
import sharp from 'sharp';
import path from 'path';

AWS.config.update({
  accessKeyId: process.env.AWS_AK,
  secretAccessKey: process.env.AWS_SK,
  // region: 'your-region' // 请确保替换为实际的AWS区域
});

const s3 = new AWS.S3();

const resolveImagePath = (localImagePath: string): string => {
  if (localImagePath.startsWith('@/')) {
    return path.resolve(process.cwd(), localImagePath.replace('@/', ''));
  }
  return path.resolve(process.cwd(), localImagePath);
};

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
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}

export async function processAndUploadImage(imageUrl: string, localImagePath: string, bucketName: string, s3Key: string) {
  try {
    // 下载生成的图像
    const imageStream = await fetchImageStream(imageUrl);

    // 将流转换为Buffer
    const imageBuffer = await streamToBuffer(imageStream);

    // 解析路径
    // const resolvedLocalImagePath = path.resolve(localImagePath)
    // console.log("dir Name", __dirname);
    // const resolvedLocalImagePath = path.resolve(__dirname, localImagePath.replace('@', ''));
    const resolvedLocalImagePath = resolveImagePath(localImagePath);
    // const resolvedLocalImagePath = path.resolve(process.cwd(), localImagePath.replace('@', ''));
    // console.log("Resolved local image path:", resolvedLocalImagePath);
    // log time and path 
    console.log("Time:", new Date().toISOString(), "Path:", resolvedLocalImagePath);
    

    // 读取本地图像
    const localImage = sharp(resolvedLocalImagePath);

    // 获取本地图像的元数据
    const metadata = await localImage.metadata();
    const { width, height } = metadata;
    if (width === undefined || height === undefined) {
      throw new Error('Failed to get image dimensions');
    }

    console.log("Local image metadata:", { width, height });

    // 将生成的图像覆盖在本地图像上
    const overlaidImage = await localImage.composite([{
      input: imageBuffer,
      top: Math.round((height - 300) / 2), // 根据需要调整尺寸
      left: Math.round((width - 500) / 2),
    }]).toBuffer();

    // 上传合成后的图像到 S3
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: overlaidImage,
    };

    return s3.upload(uploadParams).promise();
  } catch (error) {
    console.error('Failed to process and upload image:', error);
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
