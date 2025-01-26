export const environment = {
  production: true,
  backendUrl: '__apibackendurl__',
  websocketUrl: '__websocketurl__',
  posthogToken: '__posthogToken__',
  auth0: {
    domain: '__auth0__domain__',
    clientId: '__auth0__clientId__',
    authorizationParams: {
      audience: '',
      redirect_uri: '__auth0__redirectUri__',
    },
  },
  telemetry: {
    enabled: true,
    applicationInsightsKey: '__applicationInsightsKey__',
    googleAnalyticsKey: '__googleAnalyticsKey__',
  },
};
