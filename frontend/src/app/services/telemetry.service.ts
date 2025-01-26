import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from 'src/environments/environment';
import { AuthService } from '@auth0/auth0-angular';

// eslint-disable-next-line
declare let gtag: Function;

/**
 * This is the Telemetry Service, we use two services: Application Insights and Google Analytics.
 * GA is for long term trends and AI is for mostly for debugging purposes.
 *
 */
@Injectable()
export class TelemetryService {
  private appInsights: ApplicationInsights;

  public constructor(private router: Router) {
    if (environment.telemetry.enabled) {
      //
      // Application Insights
      //
      const backendUrlHost = new URL(environment.backendUrl).hostname;
      this.appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: environment.telemetry.applicationInsightsKey,
          enableAutoRouteTracking: true,
          // The SDK will add two headers ('Request-Id' and 'Request-Context') to all CORS requests to correlate outgoing AJAX dependencies with corresponding requests on the server side.
          enableCorsCorrelation: true,
          // Enable correlation headers for specific domains. In other words, don't add this
          // new header to other dependencies.
          correlationHeaderDomains: [backendUrlHost],
        },
      });

      //
      // TODO: Attach user information to AI
      //

      //
      // Google Analytics
      //
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // gtag('config', environment.telemetry.googleAnalyticsKey, {
          //   page_path: event.urlAfterRedirects,
          // });
        }
      });
    }
  }

  public getAppInsightsDetails() {
    return this.appInsights;
  }

  /**
   * Currently NOT used, since the SDK tracks route changes automatically.
   *
   * @param name The name of then page
   * @param url The url of the page
   */
  private logPageView(name?: string, url?: string) {
    if (environment.telemetry.enabled) {
      this.appInsights.trackPageView({
        name,
        uri: url,
      });
    }
  }

  public logEvent(name: string, properties?: { [key: string]: any }) {
    if (environment.telemetry.enabled) {
      this.appInsights.trackEvent({ name }, properties);
    }
  }

  public logMetric(name: string, average: number, properties?: { [key: string]: any }) {
    if (environment.telemetry.enabled) {
      this.appInsights.trackMetric({ name, average }, properties);
    }
  }

  public logException(exception: Error, severityLevel?: number) {
    //
    // TODO: This code needs to read exception.error in the case that it has useful information (it does).
    //
    if (environment.telemetry.enabled) {
      this.appInsights.trackException({ exception, severityLevel });
    }
  }

  public logTrace(message: string, properties?: { [key: string]: any }) {
    if (environment.telemetry.enabled) {
      this.appInsights.trackTrace({ message }, properties);
    }
  }
}
