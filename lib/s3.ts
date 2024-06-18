import { Readable } from "stream";

import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_AK,
  secretAccessKey: process.env.AWS_SK,
});

const s3 = new AWS.S3();

export async function uploadToS3(
  object: Readable | Buffer,
  bucketName: string,
  s3Key: string
) {
  const uploadParams = {
    Bucket: bucketName,
    Key: s3Key,
    Body: object,
  };

  return s3.upload(uploadParams).promise();
}
