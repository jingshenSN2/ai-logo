import { Logo } from "@/types/logo";
import { getDocClient } from "./db";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const LOGO_TABLE_NAME = process.env.DYNAMODB_TABLE_PREFIX + "logo";

export async function insertLogo(logo: Logo) {
  const docClient = getDocClient();
  const command = new PutCommand({
    TableName: LOGO_TABLE_NAME,
    Item: logo,
  });
  try {
    const response = await docClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getLogosCount(): Promise<number> {
  // Query the count of logos
  const docClient = getDocClient();
  const command = new QueryCommand({
    TableName: LOGO_TABLE_NAME,
    Select: "COUNT",
  });
  try {
    const response = await docClient.send(command);
    return response.Count || 0;
  } catch (error) {
    throw error;
  }
}

export async function getUserLogosCount(user_email: string): Promise<number> {
  const docClient = getDocClient();
  const command = new QueryCommand({
    TableName: LOGO_TABLE_NAME,
    IndexName: "user_email-index",
    KeyConditionExpression: "user_email = :email",
    ExpressionAttributeValues: {
      ":email": user_email,
    },
    Select: "COUNT",
  });
  try {
    const response = await docClient.send(command);
    return response.Count || 0;
  } catch (error) {
    console.log("getUserLogosCount error: ", error);
    throw error;
  }
}

export async function getLogos(
  page: number,
  limit: number
): Promise<Logo[] | undefined> {
  if (page < 1) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const docClient = getDocClient();
  const command = new ScanCommand({
    TableName: LOGO_TABLE_NAME,
    Limit: limit,
  });
  try {
    const response = await docClient.send(command);
    return response.Items as Logo[];
  } catch (error) {
    throw error;
  }
}
