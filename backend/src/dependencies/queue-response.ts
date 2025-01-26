import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import {
  BadRequestException,
  ForbiddenException,
  GenericException,
  NotFoundException,
} from "./exceptions";
import { ZodError } from "zod";

export function createOkResponse(): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 200,
  };
}

export function createErrorResponse(
  e: Error
): APIGatewayProxyStructuredResultV2 {
  let result: APIGatewayProxyStructuredResultV2;
  if (e instanceof BadRequestException || e instanceof ZodError) {
    result = makeErrorResponse(e, "Bad request");
  } else if (e instanceof GenericException) {
    result = makeErrorResponse(e, "Something went wrong.");
  } else if (e instanceof ForbiddenException) {
    result = makeErrorResponse(e, "Forbidden");
  } else if (e instanceof NotFoundException) {
    result = makeErrorResponse(e, "Not found");
  } else {
    result = makeErrorResponse(e, "Internal server error");
  }
  return result;
}

function makeErrorResponse(
  e: Error,
  defaultMessage: string
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: e?.message ?? defaultMessage,
    }),
  };
}
