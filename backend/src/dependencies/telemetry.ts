import { TelemetryClient } from "applicationinsights";

import { logger } from "./logger";

require("dotenv").config();

export class TelemetryService {
  private instrumentationKey: string = !process.env.AI_INSTRUMENTATIONKEY
    ? ""
    : process.env.AI_INSTRUMENTATIONKEY;
  private enabled = false;

  private static instance: TelemetryService;
  private operationId: string;
  private parentOperationId: string;
  private appInsightsClient: TelemetryClient;
  private awsRequestId = "";
  private requestTimerStart: Date;

  private constructor() {
    if (!this.instrumentationKey) {
      logger.warn(
        "TelemetryService is missing instrumentation key, skipping telemetry service"
      );
      return;
    }

    const runningInTests =
      process.env.NODE_ENV && process.env.NODE_ENV === "test";
    if (runningInTests) {
      return;
    }

    this.appInsightsClient = new TelemetryClient(this.instrumentationKey);
    this.appInsightsClient.config.enableUseDiskRetryCaching = false;
    this.appInsightsClient.config.enableSendLiveMetrics = false;
    this.appInsightsClient.context.tags[
      this.appInsightsClient.context.keys.cloudRole
    ] = "Backend";

    const flushAsync = this.appInsightsClient.flush.bind(
      this.appInsightsClient
    );

    this.appInsightsClient.flush = function (): Promise<string> {
      return new Promise((resolve) =>
        flushAsync({
          callback: () => {
            resolve("Sent");
          },
        })
      );
    };

    this.enabled = true;
  }

  public startTimer() {
    this.requestTimerStart = new Date();
  }

  /**
   * Do the math to get the duration of the timer.
   *
   * @returns the duration in milliseconds
   */
  public endTimerAndGetMsDuration() {
    if (!this.requestTimerStart) {
      // You never started the timer.
      return 0;
    }
    return new Date().getTime() - this.requestTimerStart.getTime();
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public flush() {
    if (this.enabled) {
      return this.appInsightsClient.flush();
    }
  }

  public setAwsRequestId(awsRequestId: string) {
    this.awsRequestId = awsRequestId;
  }

  public getOperationId() {
    return this.operationId;
  }

  public setOperationId(operationId: string, parentOperationId?: string) {
    if (operationId) {
      this.operationId = operationId;
      this.appInsightsClient.context.tags[
        this.appInsightsClient.context.keys.operationId
      ] = this.operationId;
    }

    if (parentOperationId) {
      this.parentOperationId = parentOperationId;
      this.appInsightsClient.context.tags[
        this.appInsightsClient.context.keys.operationParentId
      ] = this.parentOperationId;
    }
  }

  public logRequest(
    name,
    url,
    duration,
    resultCode,
    success,
    properties?: { [key: string]: any }
  ) {
    if (this.enabled) {
      this.appInsightsClient.trackRequest({
        name: name,
        url: url,
        duration: duration,
        success: success,
        resultCode: resultCode,
        properties: { awsRequestId: this.awsRequestId, ...properties },
      });
    }
  }

  public logEvent(name: string, properties?: { [key: string]: any }) {
    if (this.enabled) {
      this.appInsightsClient.trackEvent({
        name,
        properties: { awsRequestId: this.awsRequestId, ...properties },
      });
    }

    this.flush();
  }

  public logException(
    exception: Error,
    severityLevel?: number,
    properties?: { [key: string]: any }
  ) {
    if (this.enabled)
      this.appInsightsClient.trackException({
        exception: exception,
        severity: severityLevel,
        properties: { awsRequestId: this.awsRequestId, ...properties },
      });
    this.flush();
  }
}
