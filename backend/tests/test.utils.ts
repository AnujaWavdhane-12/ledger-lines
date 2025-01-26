import * as api from "../src/handlers/DefaultApi";
import { Callback } from "aws-lambda";
import { ApiEvent } from "./apiEvent";
import { readFileSync } from "fs";
import path from "path";
import { SQLiteDatabaseConnection } from "../src/dependencies/sqlite.database";
import { RealClock } from "../src/dependencies/clock-real";
import { VirtualClock } from "../src/dependencies/clock-virtual";

export class TestUtils {
  static emptyCallback: Callback<any> = () => {
    return Promise.resolve();
  };

  static setCurrentVirtualTime = (date: Date) => {
    let systemClock = new VirtualClock();
    systemClock.setCurrentTime(date);
    Object.assign(TestUtils.lambdaContext, { systemClock: systemClock });
  };

  static lambdaContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    awsRequestId: "original from test",
    logGroupName: "",
    logStreamName: "",

    // Added via tests
    systemClock: new RealClock(),

    getRemainingTimeInMillis: function (): number {
      throw new Error("Function not implemented.");
    },
    done: function (error?: Error, result?: any): void {
      throw new Error("Function not implemented.");
    },
    fail: function (error: string | Error): void {
      throw new Error("Function not implemented.");
    },
    succeed: function (messageOrObject: any): void {
      throw new Error("Function not implemented.");
    },
  };
}

export const itOnlyRunInLocal = !process.env.CI ? it : it.skip;

export function randomString() {
  return Array.from({ length: 10 }, () => Math.random().toString(36)[2]).join(
    ""
  );
}
