import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import cors from "@middy/http-cors";

export const defaultMiddleware = [
  httpHeaderNormalizer(),
  cors({ origin: "*" }),
  jsonBodyParser(),
  doNotWaitForEmptyEventLoop(),
  //
  // There are issues with mixing the error handler and the logging mechanism.
  // Uncaught exceptions result in: "errorMessage": "this[writeSym] is not a function",
  //
  //httpErrorHandler({
  //  logger: logger.error,
  //  fallbackMessage: "Middy -- Internal Server Error",
  //}),
  //
];
