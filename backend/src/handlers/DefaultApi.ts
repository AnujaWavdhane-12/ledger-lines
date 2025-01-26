// ////////////////////////////////////////////////////////// //
// NodeJs -- Autgenerated code, do not change.
//
// Microservice for partner managment
//
// Generated: 2024-12-20T15:52:30.689059500-06:00[America/Mexico_City]
//
// ////////////////////////////////////////////////////////// //

import { apiGateway } from "../lib/middleware/api";
import { RestApiImplementation } from "./api";

import {
  BankAccountMapping,
  BankAccountMappingResult,
  BankLinkConnectionRequest,
  Client,
  LedgerAccount,
  Organization,
  Partner,
  PartnerOnboardingRequest,
  RedirectionUrl,
  SendMessageRequest,
  ShareClientParams,
  Transaction,
  TransactionCategorizationRequest,
  User,
} from "../models/sdk/models";

import {
  BadRequestException,
  GenericException,
  NotFoundException,
  ForbiddenException,
} from "../dependencies/exceptions";

// Logging and Telemetry
import { TelemetryService } from "../dependencies/telemetry";
import { logger } from "./../dependencies/logger";

//
// Read the body from the request
//
const getRequestBody = (event) => {
  let body: any = {};
  if (event.body != undefined) {
    //
    // HTTP Request
    //
    body = JSON.parse(JSON.stringify(event.body));
  } else if (event.Records != undefined) {
    //
    // SQS Request
    //
    body = JSON.parse(JSON.stringify(event.Records[0].body));
  }
  return body;
};

//
// PUT /api/api/categorize
//
// * PUT categorizeTransactionOnLedger
// * Summary: Categorize a transaction on a ledger
// * Notes: Categorizes the transaction in the ledger and updates its data in the database.  This operation is meant to be called in a background task or queue.
//
//
export const categorizeTransactionOnLedger = apiGateway(
  async (event, context) => {
    logger.info(
      `======= >>>> API CALL categorizeTransactionOnLedger <<<< ================`
    );

    // Body parameters
    let body: TransactionCategorizationRequest;
    try {
      body = getRequestBody(event);
    } catch (e) {
      logger.error("Unable to deserialize request");
      logger.error(e);
      // Invalid input, unable to deserialize to TransactionCategorizationRequest
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Unable to parse input." }),
      };
    }

    try {
      const { db, queue, systemClock } = context as any;
      const api = new RestApiImplementation(db, queue, systemClock, event);

      // The call to the API
      await api.categorizeTransactionOnLedger(body);
    } catch (e) {
      logger.error("API threw an exception");
      logger.error(e);

      const telemetry = TelemetryService.getInstance();
      if (e instanceof NotFoundException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: e.messageToUser ?? "The resource was not found",
          }),
        };
      } else if (e instanceof ForbiddenException) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
        };
      } else if (e instanceof BadRequestException) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
        };
      } else if (e instanceof GenericException) {
        telemetry.logException(e);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: e.messageToUser ?? "Something went wrong.",
          }),
        };
      }

      // Unhandled Exception !!!
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Something went wrong." }),
      };
    }

    return { statusCode: 200 };
  }
);
//
// POST /api/api/clients
//
// * POST createClient
// * Summary: Create a new client
// * Notes: Creates a client with the given data for a given partner and a given organization.
//
//
export const createClient = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL createClient <<<< ================`);

  // Body parameters
  let body: Client;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to Client
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.createClient(body);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/partners/{partner_id}/organizations/{organization_id}/transactions
//
// * POST createTransactionForOrganization
// * Summary:
// * Notes:
//
//
export const createTransactionForOrganization = apiGateway(
  async (event, context) => {
    logger.info(
      `======= >>>> API CALL createTransactionForOrganization <<<< ================`
    );

    // Path parameter
    const partnerId = Number(event.pathParameters?.partner_id);
    if (!partnerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Missing parameters." }),
      };
    }
    // Path parameter
    const organizationId = Number(event.pathParameters?.organization_id);
    if (!organizationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Missing parameters." }),
      };
    }

    // Body parameters
    let body: Transaction;
    try {
      body = getRequestBody(event);
    } catch (e) {
      logger.error("Unable to deserialize request");
      logger.error(e);
      // Invalid input, unable to deserialize to Transaction
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Unable to parse input." }),
      };
    }

    try {
      const { db, queue, systemClock } = context as any;
      const api = new RestApiImplementation(db, queue, systemClock, event);

      // The call to the API
      await api.createTransactionForOrganization(
        partnerId,
        organizationId,
        body
      );
    } catch (e) {
      logger.error("API threw an exception");
      logger.error(e);

      const telemetry = TelemetryService.getInstance();
      if (e instanceof NotFoundException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: e.messageToUser ?? "The resource was not found",
          }),
        };
      } else if (e instanceof ForbiddenException) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
        };
      } else if (e instanceof BadRequestException) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
        };
      } else if (e instanceof GenericException) {
        telemetry.logException(e);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: e.messageToUser ?? "Something went wrong.",
          }),
        };
      }

      // Unhandled Exception !!!
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Something went wrong." }),
      };
    }

    return { statusCode: 200 };
  }
);
//
// PUT /api/api/clients/{client_id}
//
// * PUT editClient
// * Summary: Edit client data
// * Notes: Update client data
//
//
export const editClient = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL editClient <<<< ================`);

  // Path parameter
  const clientId = Number(event.pathParameters?.client_id);
  if (!clientId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  // Body parameters
  let body: Client;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to Client
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.editClient(body, clientId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// PUT /api/api/partners/{partner_id}/organizations/{organization_id}
//
// * PUT editOrganization
// * Summary: Edit organization data
// * Notes: update organization data
//
//
export const editOrganization = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL editOrganization <<<< ================`);

  // Path parameter
  const organizationId = Number(event.pathParameters?.organization_id);
  if (!organizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const partnerId = Number(event.pathParameters?.partner_id);
  if (!partnerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  // Body parameters
  let body: Organization;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to Organization
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.editOrganization(body, organizationId, partnerId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// GET /api/api/clients/{client_id}/mappings
//
// * GET getAccountingMappings
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getAccountingMappings = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL getAccountingMappings <<<< ================`
  );

  // Path parameter
  const clientId = Number(event.pathParameters?.client_id);
  if (!clientId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getAccountingMappings(clientId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/clients
//
// * GET getClients
// * Summary: Get a list of clients
// * Notes: Get a list of clients associated with the logged in partner. Use provided JWT token to look for clients of the logged partner
//  * Output-Formats: [application/json]
//
export const getClients = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL getClients <<<< ================`);

  // Query parameters
  const offset = Number(event.queryStringParameters?.offset || 0);

  const limit = Number(event.queryStringParameters?.limit || 10);

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getClients(offset, limit);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/partners/{partner_id}/organizations/{organization_id}/financial_accounts/connection_url
//
// * GET getFinancialInstitutionConnectionUrl
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getFinancialInstitutionConnectionUrl = apiGateway(
  async (event, context) => {
    logger.info(
      `======= >>>> API CALL getFinancialInstitutionConnectionUrl <<<< ================`
    );

    // Path parameter
    const partnerId = Number(event.pathParameters?.partner_id);
    if (!partnerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Missing parameters." }),
      };
    }
    // Path parameter
    const organizationId = Number(event.pathParameters?.organization_id);
    if (!organizationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Missing parameters." }),
      };
    }

    let result;
    try {
      const { db, queue, systemClock } = context as any;
      const api = new RestApiImplementation(db, queue, systemClock, event);

      // The call to the API
      result = await api.getFinancialInstitutionConnectionUrl(
        partnerId,
        organizationId
      );
    } catch (e) {
      logger.error("API threw an exception");
      logger.error(e);

      const telemetry = TelemetryService.getInstance();
      if (e instanceof NotFoundException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: e.messageToUser ?? "The resource was not found",
          }),
        };
      } else if (e instanceof ForbiddenException) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
        };
      } else if (e instanceof BadRequestException) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
        };
      } else if (e instanceof GenericException) {
        telemetry.logException(e);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: e.messageToUser ?? "Something went wrong.",
          }),
        };
      }

      // Unhandled Exception !!!
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Something went wrong." }),
      };
    }

    return { statusCode: 200, body: JSON.stringify(result) };
  }
);
//
// GET /api/api/partners/{partner_id}/organizations/{organization_id}/ledgers/{ledger_id}/accounts
//
// * GET getLedgerChartOfAccounts
// * Summary: A list of accounts.
// * Notes:
//  * Output-Formats: [application/json]
//
export const getLedgerChartOfAccounts = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL getLedgerChartOfAccounts <<<< ================`
  );

  // Path parameter
  const partnerId = Number(event.pathParameters?.partner_id);
  if (!partnerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const organizationId = Number(event.pathParameters?.organization_id);
  if (!organizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const ledgerId = Number(event.pathParameters?.ledger_id);
  if (!ledgerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getLedgerChartOfAccounts(
      partnerId,
      organizationId,
      ledgerId
    );
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/partners/{partner_id}/organizations/{organization_id}/ledgers/{ledger_id}/connection_url
//
// * GET getLedgerConnectionUrl
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getLedgerConnectionUrl = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL getLedgerConnectionUrl <<<< ================`
  );

  // Path parameter
  const partnerId = Number(event.pathParameters?.partner_id);
  if (!partnerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const organizationId = Number(event.pathParameters?.organization_id);
  if (!organizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const ledgerId = Number(event.pathParameters?.ledger_id);
  if (!ledgerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getLedgerConnectionUrl(
      partnerId,
      organizationId,
      ledgerId
    );
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/partners/{partner_id}/organizations/{organization_id}/ledgers/{ledger_id}
//
// * GET getLedgerDetails
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getLedgerDetails = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL getLedgerDetails <<<< ================`);

  // Path parameter
  const partnerId = Number(event.pathParameters?.partner_id);
  if (!partnerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const organizationId = Number(event.pathParameters?.organization_id);
  if (!organizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const ledgerId = Number(event.pathParameters?.ledger_id);
  if (!ledgerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getLedgerDetails(partnerId, organizationId, ledgerId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/clients/organizations/{organization_id}
//
// * GET getOrganizationClients
// * Summary: GetOrganizationBasedClients
// * Notes: get all clients from a organization
//  * Output-Formats: [application/json]
//
export const getOrganizationClients = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL getOrganizationClients <<<< ================`
  );

  // Path parameter
  const organizationId = Number(event.pathParameters?.organization_id);
  if (!organizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getOrganizationClients(organizationId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/partners/{partner_id}/organizations
//
// * GET getOrganizationsForPartner
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getOrganizationsForPartner = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL getOrganizationsForPartner <<<< ================`
  );

  // Path parameter
  const partnerId = Number(event.pathParameters?.partner_id);
  if (!partnerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getOrganizationsForPartner(partnerId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// POST /api/api/partners/fromEmails
//
// * POST getPartnersFromEmails
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getPartnersFromEmails = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL getPartnersFromEmails <<<< ================`
  );

  // Body parameters
  let body: string[];
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to string
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getPartnersFromEmails(body);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/transactions/{transaction_id}
//
// * GET getTransactionId
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getTransactionId = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL getTransactionId <<<< ================`);

  // Path parameter
  const transactionId = Number(event.pathParameters?.transaction_id);
  if (!transactionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getTransactionId(transactionId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// GET /api/api/clients/{client_id}/transactions
//
// * GET getTransactionsForClient
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getTransactionsForClient = apiGateway(
  async (event, context) => {
    logger.info(
      `======= >>>> API CALL getTransactionsForClient <<<< ================`
    );

    // Query parameters

    const merchantQuery = event.queryStringParameters?.merchantQuery;

    const categorizationStatus =
      event.queryStringParameters?.categorizationStatus;

    const dateStart = event.queryStringParameters?.dateStart;

    const dateEnd = event.queryStringParameters?.dateEnd;

    // Path parameter
    const clientId = Number(event.pathParameters?.client_id);
    if (!clientId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Missing parameters." }),
      };
    }

    let result;
    try {
      const { db, queue, systemClock } = context as any;
      const api = new RestApiImplementation(db, queue, systemClock, event);

      // The call to the API
      result = await api.getTransactionsForClient(
        clientId,
        merchantQuery,
        categorizationStatus,
        dateStart,
        dateEnd
      );
    } catch (e) {
      logger.error("API threw an exception");
      logger.error(e);

      const telemetry = TelemetryService.getInstance();
      if (e instanceof NotFoundException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: e.messageToUser ?? "The resource was not found",
          }),
        };
      } else if (e instanceof ForbiddenException) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
        };
      } else if (e instanceof BadRequestException) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
        };
      } else if (e instanceof GenericException) {
        telemetry.logException(e);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: e.messageToUser ?? "Something went wrong.",
          }),
        };
      }

      // Unhandled Exception !!!
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Something went wrong." }),
      };
    }

    return { statusCode: 200, body: JSON.stringify(result) };
  }
);
//
// GET /api/api/users/{auth0_id}
//
// * GET getUserByAuth0Id
// * Summary:
// * Notes:
//  * Output-Formats: [application/json]
//
export const getUserByAuth0Id = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL getUserByAuth0Id <<<< ================`);

  // Path parameter
  const auth0Id = event.pathParameters?.auth0_id;
  if (!auth0Id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  let result;
  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    result = await api.getUserByAuth0Id(auth0Id);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
});
//
// POST /api/api/partners/{auth0_id}/onboard
//
// * POST onboardUser
// * Summary: Create a user with a given auth0 id
// * Notes:
//
//
export const onboardUser = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL onboardUser <<<< ================`);

  // Path parameter
  const auth0Id = event.pathParameters?.auth0_id;
  if (!auth0Id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  // Body parameters
  let body: PartnerOnboardingRequest;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to PartnerOnboardingRequest
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.onboardUser(body, auth0Id);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/partners/{partner_id}/organizations/{organization_id}/ledgers/{ledger_id}/accounts
//
// * POST refreshChartOfAccounts
// * Summary: Import the Chart of Accounts from the Ledger
// * Notes:
//
//
export const refreshChartOfAccounts = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL refreshChartOfAccounts <<<< ================`
  );

  // Path parameter
  const partnerId = Number(event.pathParameters?.partner_id);
  if (!partnerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const organizationId = Number(event.pathParameters?.organization_id);
  if (!organizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }
  // Path parameter
  const ledgerId = Number(event.pathParameters?.ledger_id);
  if (!ledgerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.refreshChartOfAccounts(partnerId, organizationId, ledgerId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/clients/{client_id}/mappings
//
// * POST saveMappings
// * Summary:
// * Notes:
//
//
export const saveMappings = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL saveMappings <<<< ================`);

  // Path parameter
  const clientId = Number(event.pathParameters?.client_id);
  if (!clientId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  // Body parameters
  let body: BankAccountMapping[];
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to BankAccountMapping
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.saveMappings(body, clientId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/users/{auth0_id}
//
// * POST saveUser
// * Summary: Create a user with a given auth0 id
// * Notes:
//
//
export const saveUser = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL saveUser <<<< ================`);

  // Path parameter
  const auth0Id = event.pathParameters?.auth0_id;
  if (!auth0Id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  // Body parameters
  let body: User;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to User
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.saveUser(body, auth0Id);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/messages/channel/{channel_id}/send
//
// * POST sendMessage
// * Summary: Send a message
// * Notes:
//
//
export const sendMessage = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL sendMessage <<<< ================`);

  // Path parameter
  const channelId = Number(event.pathParameters?.channel_id);
  if (!channelId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  // Body parameters
  let body: SendMessageRequest;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to SendMessageRequest
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.sendMessage(channelId, body);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/share
//
// * POST shareClientsforPartners
// * Summary: Share multiple clients with multiple partners
// * Notes:
//
//
export const shareClientsforPartners = apiGateway(async (event, context) => {
  logger.info(
    `======= >>>> API CALL shareClientsforPartners <<<< ================`
  );

  // Body parameters
  let body: ShareClientParams;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to ShareClientParams
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.shareClientsforPartners(body);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/transactions/{transaction_id}/suggest
//
// * POST suggestCategoryForTransaction
// * Summary:
// * Notes:
//
//
export const suggestCategoryForTransaction = apiGateway(
  async (event, context) => {
    logger.info(
      `======= >>>> API CALL suggestCategoryForTransaction <<<< ================`
    );

    // Path parameter
    const transactionId = Number(event.pathParameters?.transaction_id);
    if (!transactionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reason: "Missing parameters." }),
      };
    }

    try {
      const { db, queue, systemClock } = context as any;
      const api = new RestApiImplementation(db, queue, systemClock, event);

      // The call to the API
      await api.suggestCategoryForTransaction(transactionId);
    } catch (e) {
      logger.error("API threw an exception");
      logger.error(e);

      const telemetry = TelemetryService.getInstance();
      if (e instanceof NotFoundException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: e.messageToUser ?? "The resource was not found",
          }),
        };
      } else if (e instanceof ForbiddenException) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
        };
      } else if (e instanceof BadRequestException) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
        };
      } else if (e instanceof GenericException) {
        telemetry.logException(e);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: e.messageToUser ?? "Something went wrong.",
          }),
        };
      }

      // Unhandled Exception !!!
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Something went wrong." }),
      };
    }

    return { statusCode: 200 };
  }
);
//
// POST /api/api/transactions/{transaction_id}
//
// * POST updateTransaction
// * Summary: Update the category of a transaction.
// * Notes:
//
//
export const updateTransaction = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL updateTransaction <<<< ================`);

  // Path parameter
  const transactionId = Number(event.pathParameters?.transaction_id);
  if (!transactionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Missing parameters." }),
    };
  }

  // Body parameters
  let body: Transaction;
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to Transaction
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.updateTransaction(body, transactionId);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
//
// POST /api/api/transactions
//
// * POST updateTransactions
// * Summary: Update multiple transactions at once.
// * Notes:
//
//
export const updateTransactions = apiGateway(async (event, context) => {
  logger.info(`======= >>>> API CALL updateTransactions <<<< ================`);

  // Body parameters
  let body: Transaction[];
  try {
    body = getRequestBody(event);
  } catch (e) {
    logger.error("Unable to deserialize request");
    logger.error(e);
    // Invalid input, unable to deserialize to Transaction
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: "Unable to parse input." }),
    };
  }

  try {
    const { db, queue, systemClock } = context as any;
    const api = new RestApiImplementation(db, queue, systemClock, event);

    // The call to the API
    await api.updateTransactions(body);
  } catch (e) {
    logger.error("API threw an exception");
    logger.error(e);

    const telemetry = TelemetryService.getInstance();
    if (e instanceof NotFoundException) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e.messageToUser ?? "The resource was not found",
        }),
      };
    } else if (e instanceof ForbiddenException) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: e.messageToUser ?? "Forbidden." }),
      };
    } else if (e instanceof BadRequestException) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: e.messageToUser ?? "Bad request." }),
      };
    } else if (e instanceof GenericException) {
      telemetry.logException(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.messageToUser ?? "Something went wrong.",
        }),
      };
    }

    // Unhandled Exception !!!
    telemetry.logException(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }

  return { statusCode: 200 };
});
