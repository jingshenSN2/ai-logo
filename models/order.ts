import { Order } from "@/types/order";
import { getDocClient } from "@/models/db";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ORDER_TABLE_NAME = process.env.DYNAMODB_TABLE_PREFIX + "order";

export async function insertOrder(order: Order) {
  const docClient = getDocClient();
  const command = new PutCommand({
    TableName: ORDER_TABLE_NAME,
    Item: order,
  });

  try {
    const response = await docClient.send(command);
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function findOrderByOrderNo(
  order_no: number
): Promise<Order | undefined> {
  const docClient = getDocClient();
  const command = new GetCommand({
    TableName: ORDER_TABLE_NAME,
    Key: {
      id: order_no,
    },
  });

  try {
    const response = await docClient.send(command);
    console.log(response);
    return response.Item as Order;
  } catch (error) {
    throw error;
  }
}

export async function updateOrderStatus(
  order_no: string,
  order_status: number,
  paied_at: string
) {
  const docClient = getDocClient();
  const command = new PutCommand({
    TableName: ORDER_TABLE_NAME,
    Item: {
      id: order_no,
      order_status: order_status,
      paied_at: paied_at,
    },
  });

  try {
    const response = await docClient.send(command);
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateOrderSession(
  order_no: string,
  stripe_session_id: string
) {
  const docClient = getDocClient();
  const command = new PutCommand({
    TableName: ORDER_TABLE_NAME,
    Item: {
      id: order_no,
      stripe_session_id: stripe_session_id,
    },
  });

  try {
    const response = await docClient.send(command);
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getUserOrders(
  user_id: string
): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const docClient = getDocClient();
  const command = new QueryCommand({
    TableName: ORDER_TABLE_NAME,
    IndexName: "user_id-index",
    KeyConditionExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
      ":user_id": user_id,
    },
  });

  try {
    const response = await docClient.send(command);
    return (response.Items as Order[]).filter(
      (order) => order.created_at <= now
    );
  } catch (error) {
    throw error;
  }
}
