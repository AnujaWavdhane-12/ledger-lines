import {
  APIGatewayProxyEventV2,
  Handler,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

export type LambdaApiHandler = Handler<LambdaEvent, LambdaResult>;

export type LambdaEvent = APIGatewayProxyEventV2;

export type LambdaResult = APIGatewayProxyStructuredResultV2;
