import { getDocClient } from "@/models/db";
import { Logo } from "@/types/logo";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const PUBLIC_LOGO_TABLE_NAME =
  process.env.DYNAMODB_TABLE_PREFIX + "public-logo";

export async function toggleLogoPublicity(
  logo: Logo
): Promise<"public" | "private"> {
  const docClient = getDocClient();
  // Put if not exists, or delete if exists
  // return the new state
  const command = new GetCommand({
    TableName: PUBLIC_LOGO_TABLE_NAME,
    Key: {
      id: logo.id,
    },
  });

  try {
    const response = await docClient.send(command);
    if (response.Item) {
      const deleteCommand = new DeleteCommand({
        TableName: PUBLIC_LOGO_TABLE_NAME,
        Key: {
          id: logo.id,
        },
      });
      await docClient.send(deleteCommand);
      return "private";
    } else {
      const putCommand = new PutCommand({
        TableName: PUBLIC_LOGO_TABLE_NAME,
        Item: logo,
      });
      await docClient.send(putCommand);
      return "public";
    }
  } catch (error) {
    throw error;
  }
}

export async function getPublicLogos() {
  const docClient = getDocClient();
  const command = new ScanCommand({
    TableName: PUBLIC_LOGO_TABLE_NAME,
  });
  try {
    const response = await docClient.send(command);
    const logos = response.Items as Logo[];
    logos.sort((a, b) => {
      return a.created_at < b.created_at ? 1 : -1;
    });
    return logos;
  } catch (error) {
    throw error;
  }
}
