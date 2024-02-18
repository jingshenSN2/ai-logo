import { User } from "@/types/user";
import { getDocClient } from "@/models/db";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const USER_TABLE_NAME = process.env.DYNAMODB_TABLE_PREFIX + "user";

export async function insertUser(user: User) {
  const createdAt: string = new Date().toISOString();

  const docClient = getDocClient();
  const command = new PutCommand({
    TableName: USER_TABLE_NAME,
    Item: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      created_at: createdAt,
    },
  });

  try {
    const response = await docClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  const docClient = getDocClient();
  const command = new QueryCommand({
    TableName: USER_TABLE_NAME,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  });

  try {
    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
      return response.Items[0] as User;
    }
  } catch (error) {
    console.log("find user by email failed: ", error);
    throw error;
  }
}
