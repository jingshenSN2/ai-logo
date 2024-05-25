import fs from "fs";
import { Readable } from "stream";

import AWS from "aws-sdk";
import axios from "axios";

import * as sharp from 'sharp';

AWS.config.update({
  accessKeyId: process.env.AWS_AK,
  secretAccessKey: process.env.AWS_SK,
});

const s3 = new AWS.S3();


export async function processAndUploadImage(imageUrl: string, localImagePath: string, bucketName: string, s3Key: string) {
  try {
 
      // Download the generated image
      const response = await axios({
        method: "GET",
        url: imageUrl,
        responseType: "stream",
      });


      // Read the local image
      const localImage = sharp(localImagePath);

      // Get metadata of the local image to find dimensions
      const { width, height } = await localImage.metadata();

      // Overlay the generated image over the local image
      const overlaidImage = await localImage.composite([{
          // TODO: can input be image buffer??
          input: response.data, 
          // Position the generated image in the center of the local image
          top: Math.round((height - 300) / 2), // TODO: need to ddjust dimensions based on needs !!
          left: Math.round((width - 500) / 2),
      }]).toBuffer();

      const uploadParams = {
        Bucket: bucketName,
        Key: s3Key,
        Body: overlaidImage as Readable,
      };

      // Upload the overlaid image to S3
      return s3.upload(uploadParams).promise();
  } catch (error) {
      console.error('Failed to process and upload image:', error);
  }
}


export async function downloadAndUploadImage(
  imageUrl: string,
  bucketName: string,
  s3Key: string
) {
  try {
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });

    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: response.data as Readable,
    };

    return s3.upload(uploadParams).promise();
  } catch (e) {
    console.log("upload failed:", e);
    throw e;
  }
}

export async function downloadImage(imageUrl: string, outputPath: string) {
  try {
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

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
  } catch (e) {
    console.log("upload failed:", e);
    throw e;
  }
}
