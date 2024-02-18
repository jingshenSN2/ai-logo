import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let dbClient: DynamoDBClient;
let docClient: DynamoDBDocumentClient;

export function getDbClient() {
  if (!dbClient) {
    dbClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_AK as string,
        secretAccessKey: process.env.AWS_SK as string,
      },
    });
  }

  return dbClient;
}

export function getDocClient() {
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(getDbClient());
  }

  return docClient;
}
