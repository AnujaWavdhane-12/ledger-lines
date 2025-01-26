import { logger } from "../dependencies/logger";
import { apiGateway } from "../lib/middleware/api";
import { TelemetryService } from "../dependencies/telemetry";

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

import Redis from "ioredis";

//                  /----------\               /----------\
//                  | Events   |               |           |
//                  | Emmitter |               |           |
//                  |          |---- HTTP--->  |           |
//                  |          |               |           |
//                  |          |---- SQS --->  |           |
//                  |          |               |           |
//                  \----------/               |           |
//                                             |           |
//                       /----------\          |           |
//  $connect ----------> | WebSocket|<-------> |           |
//  subscribe ---------> | Gateway  |<-------> | Funciton  |
//                       |          |          |           |
//  get notified <-----  |          |          |           |
//                       \----------/          \----------/
//
//                                               ^^^^^^^^^
//                                              This file.
//

class ClientNoLongerConneted extends Error {
  constructor(
    public connectionId: string,
    public transactionId: number,
    innerError?: Error
  ) {
    super(innerError?.message);
  }
}

class WebhookNotificationService {
  private static initialized = false;
  private static redisClient: Redis | null = null;

  private static async init() {
    if (WebhookNotificationService.initialized) {
      return;
    }

    try {
      logger.info(
        `Connecting to redist ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      );

      logger.info("Redis Configuration:", {
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        VPC_ID: process.env.VPC_ID,
        SUBNET_ID: process.env.SUBNET_ID,
        SUBNET_ID_2: process.env.SUBNET_ID_2,
      });

      logger.info(
        `Connecting to redis ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      );

      WebhookNotificationService.redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
        lazyConnect: true,
        connectTimeout: 10000, // 10 seconds
        retryStrategy: (times: number) => {
          logger.info(`Redis connection retry attempt ${times}`);
          return Math.min(times * 1000, 3000);
        },
      });

      // Log connection events
      WebhookNotificationService.redisClient.on("connect", () => {
        logger.info("Redis client is connecting.");
      });

      WebhookNotificationService.redisClient.on("ready", () => {
        logger.info("Redis client is ready.");
      });

      WebhookNotificationService.redisClient.on("error", (err) => {
        logger.error("Redis client error:", err);
      });

      WebhookNotificationService.redisClient.on("close", () => {
        logger.info("Redis client connection closed.");
      });

      // Wait for connection to be ready
      await WebhookNotificationService.redisClient.connect();
      WebhookNotificationService.initialized = true;

      logger.info("Connected to Redis");
    } catch (err) {
      logger.error("Failed to connect to Redis");
      logger.error(err);
      throw err;
    }
  }

  private static async hasRedisKey(transactionId: number) {
    await WebhookNotificationService.init();
    return await WebhookNotificationService.redisClient?.exists(
      transactionId.toString()
    );
  }

  private static async getRedisKey(transactionId: number) {
    await WebhookNotificationService.init();
    return await WebhookNotificationService.redisClient?.get(
      transactionId.toString()
    );
  }

  private static async setRedisKey(transactionId: number, values: any[]) {
    await WebhookNotificationService.init();
    await WebhookNotificationService.redisClient?.set(
      transactionId.toString(),
      JSON.stringify(values)
    );
  }

  /**
   * Subscribe to changes for a given transaction.
   */
  public async subscribeToTransactionChanges(
    connectionId: string,
    transactionsStr: any // an array of transaction ids
  ) {
    logger.info(
      `Subscribing ${transactionsStr.length} transactions from connection ${connectionId}`
    );

    for (let i = 0; i < transactionsStr.length; i++) {
      const transactionId = transactionsStr[i];
      if (!(await WebhookNotificationService.hasRedisKey(transactionId))) {
        WebhookNotificationService.setRedisKey(transactionId, []);
      }

      const subscribersContents = await WebhookNotificationService.getRedisKey(
        transactionId
      );
      const subscribers = JSON.parse(subscribersContents || "[]");

      subscribers.push(connectionId);
      await WebhookNotificationService.setRedisKey(transactionId, subscribers);
      logger.info(
        `Connection ${connectionId} SUBSCRIBED to transaction ${transactionId}`
      );
    }

    logger.info(
      `Sending subscribeToTransactionComplete to connection ${connectionId}`
    );
    await this.sendSingleNotification(
      connectionId,
      '{  "COMMAND": "subscribeToTransactionComplete" }'
    );
    logger.info(`All done.`);

    const telemetryClient: TelemetryService = TelemetryService.getInstance();
    telemetryClient?.logEvent("notification:subscribe_to_event", {
      connectionId: connectionId,
      command: "subscribeToTransactionComplete",
      transactionStr: transactionsStr,
      source: "ws",
    });
  }

  /**
   * Unsubscribe to changes for a given transaction.
   */
  public async unsubscribeFromTransactionChanges(
    connectionId: string,
    transactionId: number
  ) {
    if (!(await WebhookNotificationService.hasRedisKey(transactionId))) {
      return;
    }

    const subscribersContents = await WebhookNotificationService.getRedisKey(
      transactionId
    );

    const subscribers = JSON.parse(subscribersContents || "{}");

    const index = subscribers?.indexOf(connectionId) ?? -1;
    if (index !== -1) {
      subscribers?.splice(index, 1);
    }

    await WebhookNotificationService.setRedisKey(transactionId, subscribers);

    logger.info(
      `Connection ${connectionId} UNSUBSCRIBED to transaction ${transactionId}`
    );
  }

  /**
   * Notifies all subscribers that a transaction has changed.
   *
   * @param transactionId Transaction Id that changed.
   */
  public async notifyTransactionChange(
    transactionId: number,
    suggestedCategoryId: string | null = null,
    suggestedCategory: string | null = null,
    success: boolean | null = null,
    message: string | null = null
  ) {
    logger.info(`Transaction ${transactionId} has changed.`);

    if (!(await WebhookNotificationService.hasRedisKey(transactionId))) {
      logger.info(
        `There are no subscribers for transaction ${transactionId}. Returning...`
      );
      return;
    }

    const contents = await WebhookNotificationService.getRedisKey(
      transactionId
    );

    logger.info(`Subscribers info: ${JSON.stringify(contents)}`);

    const connectionIds = JSON.parse(contents || "[]");
    if (!connectionIds) {
      logger.info(
        `There is an entry for this transaction, but there are no subscribers in the array. Returning...`
      );
      return;
    }

    logger.info(
      `Transaction ${transactionId} has ${connectionIds.length} subscribers.`
    );

    const body = JSON.stringify({
      transactionId: transactionId,
      message: message ?? `Transaction ${transactionId} has been updated.`,
      success: success,
      suggestedCategoryId: suggestedCategoryId,
      suggestedCategory: suggestedCategory,
    });

    const connectionIdsToRemove: string[] =
      await this.sendNotificationToConnections(connectionIds, body);

    for (const connectionId of connectionIdsToRemove) {
      await this.unsubscribeFromTransactionChanges(connectionId, transactionId);
      logger.info(`Removed connection ${connectionId}`);
    }
  }

  private async sendNotificationToConnections(
    connectionIds: string[],
    body: string
  ) {
    logger.info(
      `Sending notification to ${
        connectionIds.length
      } connection ids: ${connectionIds.join(", ")}`
    );
    const all = connectionIds.map((i) => this.sendSingleNotification(i, body));
    const results = await Promise.allSettled(all);

    const rejections = results
      .filter((result) => result.status === "rejected")
      .map((result: PromiseRejectedResult) => {
        return result.reason;
      });

    logger.info(JSON.stringify(rejections));
    const connectionIdsToRemove: string[] = [];
    for (const failedNotification of rejections) {
      logger.error(
        `Failed to send notification to connection ${failedNotification.connectionId}`
      );
      connectionIdsToRemove.push(failedNotification.connectionId);
    }

    return connectionIdsToRemove;
  }

  private async sendSingleNotification(id: string, body: string) {
    const ENDPOINT = process.env.WEBSOCKET_GATEWAY_ENDPOINT;
    const client = new ApiGatewayManagementApiClient({ endpoint: ENDPOINT });

    try {
      const encoder = new TextEncoder();

      logger.info(
        `Sending notification to connection ${id} with body: ${body}`
      );
      const postCmd = new PostToConnectionCommand({
        ConnectionId: id,
        Data: encoder.encode(body),
      });

      await client.send(postCmd);
    } catch (error) {
      logger.error("Failed to send notification to connection " + id);

      if (error.name === "GoneException") {
        logger.error("Caught GoneException for connection " + id);
        throw new ClientNoLongerConneted(id, -1, error);
      } else {
        logger.error(error);
        throw error;
      }

      // rethrow
      throw error;
    }
  }
}

/**
 *
 * This handler responds to WebSocket and HTTP events. This is the entry point for all events.
 *
 */
export const handle = apiGateway(async (event: any, context) => {
  //
  // Decide if this is a WebSocket, SQS or HTTP event.
  //
  const isWebSocket =
    event.requestContext?.eventType === "CONNECT" ||
    event.requestContext?.eventType === "MESSAGE";

  const isHttp = event.requestContext?.http?.protocol?.startsWith("HTTP");

  const isSqs = event.Records && event.Records[0].eventSource === "aws:sqs";

  const webhookNotificationService = new WebhookNotificationService();

  // Extract the body and route the call depending on the type and the route.
  if (isWebSocket) {
    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;

    // Determine if event.body is a string or an object
    // if it is a string, parse it
    if (typeof event.body === "string") {
      event.body = JSON.parse(event.body);
    }

    logger.info(
      `WEBSOCKET EVENT =======> routeKey: ${routeKey}, connectionId: ${connectionId}, body: ${JSON.stringify(
        event.body
      )}`
    );

    switch (routeKey) {
      case "$connect":
        break;
      case "$disconnect":
        // TODO: Unsubscribe from all transactions?
        break;
      case "subscribeToTransaction":
        await webhookNotificationService.subscribeToTransactionChanges(
          connectionId,
          event.body?.transaction_id // This can be an array
        );
        break;
      case "unsubscribeFromTransaction":
        await webhookNotificationService.unsubscribeFromTransactionChanges(
          connectionId,
          event.body?.transaction_id
        );
        break;
      case "$default":
        break;
    }
  } else if (isHttp) {
    const body = event.body;
    if (!body?.transaction_id) {
      return { statusCode: 400, body: "Missing transaction_id" };
    }

    logger.info(
      `HTTP event ========> transactionId: ${
        body.transaction_id
      }, body: ${JSON.stringify(event.body)}`
    );

    const telemetryClient: TelemetryService = TelemetryService.getInstance();
    let succeeded = false;
    try {
      await webhookNotificationService.notifyTransactionChange(
        body.transaction_id,
        body?.suggestedCategoryId ?? null,
        body?.suggestedCategory ?? null,
        body?.success ?? null,
        body?.message ?? null
      );
      succeeded = true;
    } catch (e) {
      logger.error(e);
      telemetryClient.logException(e);
      return { statusCode: 500, body: JSON.stringify({ error: e?.message }) };
    } finally {
      telemetryClient?.logEvent("notification:recieved_update", {
        transactionId: body.transaction_id,
        suggestedCategoryId: body?.suggestedCategoryId ?? null,
        suggestedCategory: body?.suggestedCategory ?? null,
        successOfUpdate: body?.success ?? null,
        message: body?.message ?? null,
        is_success: succeeded,
        source: "http",
      });
    }

    return { statusCode: 200, body: "OK" };
  } else if (isSqs) {
    const { Records } = event as any;

    // This function _can_ process multiple records at once.
    logger.info(`Processing queue trigger with ${Records.length} records.`);

    for (let i = 0; i < Records.length; i++) {
      const sqsMessage = JSON.parse(Records[i].body);

      logger.info(
        `SQS event ========> transactionId: ${
          sqsMessage.transaction_id
        }, body: ${JSON.stringify(sqsMessage)}`
      );

      const telemetryClient: TelemetryService = TelemetryService.getInstance();
      let success = false;
      try {
        await webhookNotificationService.notifyTransactionChange(
          sqsMessage.transaction_id,
          sqsMessage?.suggestedCategoryId ?? null,
          sqsMessage?.suggestedCategory ?? null,
          sqsMessage?.success ?? null,
          sqsMessage?.message ?? null
        );
        success = true;
      } catch (e) {
        logger.error(e);
        telemetryClient.logException(e);
        return { statusCode: 500, body: JSON.stringify({ error: e?.message }) };
      } finally {
        telemetryClient?.logEvent("notification:recieved_update", {
          transactionId: sqsMessage.transaction_id,
          suggestedCategoryId: sqsMessage?.suggestedCategoryId ?? null,
          suggestedCategory: sqsMessage?.suggestedCategory ?? null,
          successOfUpdate: sqsMessage?.success ?? null,
          message: sqsMessage?.message ?? null,
          is_success: success,
          source: "sqs",
        });
      }
    }
  }

  return {};
});
