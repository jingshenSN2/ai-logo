import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getDocClient } from "@/models/db";
import { User, UserCredits } from "@/types/user";
import { Logo } from "@/types/logo";

const USER_LOGO_TABLE_NAME = process.env.DYNAMODB_TABLE_PREFIX + "user-logo";

export async function insertUser(user: User) {
  const createdAt: string = new Date().toISOString();
  user.created_at = createdAt;

  const docClient = getDocClient();
  const command = new PutCommand({
    TableName: USER_LOGO_TABLE_NAME,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });

  try {
    const response = await docClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function findUser(user_id: string): Promise<User | undefined> {
  const docClient = getDocClient();
  const command = new QueryCommand({
    TableName: USER_LOGO_TABLE_NAME,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": user_id,
    },
  });

  try {
    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
      return response.Items[0] as User;
    }
  } catch (error) {
    throw error;
  }
}

export async function insertLogo(user_id: string, logo: Logo) {
  const user = await findUser(user_id);
  if (user) {
    user.logos.unshift(logo);
    const docClient = getDocClient();
    const command = new PutCommand({
      TableName: USER_LOGO_TABLE_NAME,
      Item: user,
    });

    try {
      const response = await docClient.send(command);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export async function updateLogo(
  user_id: string,
  logo_id: string,
  logoInfo: Partial<Logo>
) {
  const user = await findUser(user_id);
  if (user) {
    const idx = user.logos.findIndex((l) => l.id === logo_id);
    if (idx > -1) {
      user.logos[idx] = { ...user.logos[idx], ...logoInfo };
      const docClient = getDocClient();
      const command = new UpdateCommand({
        TableName: USER_LOGO_TABLE_NAME,
        Key: {
          id: user_id,
        },
        UpdateExpression: "SET logos = :logos",
        ExpressionAttributeValues: {
          ":logos": user.logos,
        },
      });

      try {
        const response = await docClient.send(command);
        return response;
      } catch (error) {
        throw error;
      }
    }
  }
}

export async function getLogo(
  user_id: string,
  logo_id: string
): Promise<Logo | undefined> {
  const user = await findUser(user_id);
  if (user) {
    const logo = user.logos.find((l) => l.id === logo_id);
    if (logo) {
      return logo;
    }
  }
  return undefined;
}

export async function getUserLogos(user_id: string): Promise<Logo[]> {
  const user = await findUser(user_id);
  if (user) {
    return user.logos;
  }
  return [];
}

export async function getUserCredits(user_id: string): Promise<UserCredits> {
  let user_credits: UserCredits = {
    total_credits: 10,
    used_credits: 0,
    left_credits: 0,
  };
  try {
    const user = await findUser(user_id);
    if (user) {
      user_credits.used_credits = user.logos.length;
      user_credits.left_credits =
        user_credits.total_credits - user_credits.used_credits;
    }
  } catch (e) {
    console.log("get user credits failed: ", e);
  }
  return user_credits;
}
