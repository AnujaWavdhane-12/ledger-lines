interface IApiEvent {
  body?: { [key: string]: any };
  pathParameters?: { [key: string]: any };
  headers?: { [key: string]: any };
  requestContext?: { [key: string]: any };
  queryStringParameters?: { [key: string]: any };
}

/*
Provides functionality for simulating API events in test cases.
Allows for only providing some of the event details in order
to remove boilerplate code in the testing files.
*/
export class ApiEvent implements IApiEvent {
  body: { [key: string]: any };
  pathParameters: { [key: string]: any };
  headers: { [key: string]: any };
  requestContext: { [key: string]: any };
  queryStringParameters: { [key: string]: any };

  constructor(event: IApiEvent = {}, currentUser?: string) {
    this.body = event.body ?? {};
    this.pathParameters = event.pathParameters ?? {};
    this.headers = event.headers ?? {};
    this.requestContext = event.requestContext ?? {};
    this.queryStringParameters = event.queryStringParameters ?? {};

    if (currentUser) {
      this.addUserAuth(currentUser);
    }
  }

  /*
  Add JWT authorization to an existing ApiEvent object
  */
  public addUserAuth(currentUser: string) {
    const jwtAuth = {
      jwt: {
        claims: {
          sub: currentUser,
        },
      },
    };

    this.requestContext.authorizer = jwtAuth;
  }
}
