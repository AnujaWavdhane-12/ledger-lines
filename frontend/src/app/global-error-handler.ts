import { ErrorHandler, Injectable } from '@angular/core';
import { TelemetryService } from './services/telemetry.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  public constructor(private telemetryService: TelemetryService) {}

  public handleError(error) {
    //
    // Log to the console
    //
    console.error('Error Handler Caught an Error', error);

    //
    // Send to Application Insights
    //
    this.telemetryService.logException(error);

    // Re-throw. This is needed for code that relies on
    // exceptions for control flow. This seems to be the case
    // for auth0. If we don't throw again here, then the http
    // interceptor is unable to attach the token.
    throw error;
  }
}
