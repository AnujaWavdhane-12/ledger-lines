import middy from "@middy/core";
import { Handler } from "aws-lambda";
import httpErrorHandler from "@middy/http-error-handler";
import { defaultMiddleware } from ".";
import { LambdaApiHandler } from "../types";
import { IQueueProvider } from "../../dependencies/queues/queue.interface";
import { TelemetryService } from "../../dependencies/telemetry";
import { RealClock } from "../../dependencies/clock-real";

import { logger } from "../../dependencies/logger";
import SQSQueue from "../../dependencies/queues/sqs-queue";
import { IDatabase } from "../../dependencies/database.interface";
import { SQLiteDatabaseConnection } from "../../dependencies/sqlite.database";

/**
 * This is out own custom middleware, here we instantiate the injecatble dependencies such as database,
 * azue devops clients, system clock. We also handle db connection before calling the handler
 * and close the connection after or onError.
 */
const customMiddleware: middy.MiddlewareObj = {
  before: async (request) => {
    // More information on `Context`: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
    const { context } = request;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { db, queue, devOpsClient, systemClock } = context as any;

    if (!systemClock) {
      const clock = new RealClock();
      Object.assign(context, { systemClock: clock });
    }

    if (!db) {

      try {
        //const database: PostgresDatabaseConnection = new PostgresDatabaseConnection();
        const database: IDatabase = await SQLiteDatabaseConnection.getInstance();
        Object.assign(context, { db: database });
      } catch (e) {
        logger.error("Failed to connect to the database", e);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Internal Server Error" }),
        };
      }
    }

    if (!queue) {
      try {
        const queue: IQueueProvider = new SQSQueue();
        Object.assign(context, { queue: queue });
      } catch (e) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Internal Server Error" }),
        };
      }
    }
  },
  after: (request) => {
    const { context } = request;
    //const { db } = context as any;
    //db.close();
  },
  onError: (request) => {
    const { context } = request;
    //const { db } = context as any;
    //db?.close();
  },
};

//
// Telemetry middleware
//
const telemetryMiddleware: middy.MiddlewareObj = {
  before: async (request) => {
    const { event } = request;

    const telemetry = TelemetryService.getInstance();

    // Note on timing. There is a property `event.requestContext['timeEpoch']` that has
    // the time the request started (from the point of view of the server I assume), now this time
    // is up to 1 seconds before this code gets executed, which is not impossible to think about.
    // Instead of using this, we will start a timer here and end it at the end of the request.
    telemetry.startTimer();

    // Grab the request id. This is added by AWS Lambda as a context, at the start of the
    // If we have it, then we can attach it to every telemetry call as custom dimension.
    const awsRequestId = event?.requestContext
      ? event?.requestContext["requestId"]
      : null;
    telemetry.setAwsRequestId(awsRequestId);

    if (event?.rawHeaders && event.rawHeaders["request-id"]) {
      const [operationId, id] = event?.rawHeaders["request-id"]
        ?.substr(1)
        .split(".");
      telemetry.setOperationId(operationId, id);
    }
  },
  after: async (request) => {
    const { event, response } = request;

    // This is a request that can be triggered by a queue (SQS) or HTTP endpoint (API Gateway).
    const isHttpRequest = event.requestContext?.http !== undefined;

    const url = isHttpRequest
      ? new URL(event.rawPath, `https://${event.rawHeaders?.host}`).href
      : "SQS";

    const customDimensions = {
      functionName: request.context.functionName,

      xAmznTraceId: event?.rawHeaders
        ? event?.rawHeaders["x-amzn-trace-id"]
        : null,

      url: url,
      userAgent: event?.rawHeaders ? event?.rawHeaders["user-agent"] : null,
      currentUser: event?.rawHeaders
        ? event?.requestContext?.authorizer?.jwt?.claims?.sub
        : null,
      accountId: event?.requestContext
        ? event?.requestContext["accountId"]
        : null,
      requestId: event?.requestContext
        ? event?.requestContext["requestId"]
        : null,
      timeEpoch: event?.requestContext
        ? event?.requestContext["timeEpoch"]
        : null,
    };

    // calculate the duration of the request here
    const telemetry: TelemetryService = TelemetryService.getInstance();

    const duration = telemetry.endTimerAndGetMsDuration();
    const success = response.statusCode >= 200 && response.statusCode < 300;

    // log the request using app insights
    telemetry.logRequest(
      isHttpRequest ? event.routeKey : request.context.functionName,
      url,
      duration,
      response.statusCode,
      success,
      customDimensions
    );

    // TODO: How can we guarantee that this is flushed?
    telemetry.flush();
  },
  onError: (request) => {
    // This is not an error with the telemetry, this is when the request fails.
  },
};
export function apiGateway(handler: LambdaApiHandler, _options = {}): Handler {
  const callback = middy(handler);
  callback.use(defaultMiddleware);
  callback.use(customMiddleware);
  callback.use(httpErrorHandler());
  callback.use(telemetryMiddleware);
  return callback;
}
