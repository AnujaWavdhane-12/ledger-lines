import { logger } from "../logger";
import superagent from "superagent";
import { SupportedLedgers } from "../../models/backend/models";
import { ExportingTransactionRequest } from "./exporting-transaction-request";
import { ExportingTransactionResponse } from "./exporting-transaction-response";
import { ExportingTransferRequest } from "./exporting-transfer-request";
import { ExportingTransferResponse } from "./exporting-transfer-response";
import { LedgerConnection } from "./ledger-connection";

/**
 * Client to communicate with Propio ledger systems.
 */
export class PropioLedgersMicroservice {
  private ledgerConnectUrl: URL;
  private oauthLedgerConnectUrlTemplate: string;
  private exportTransactionUrlTemplate: string;
  private bearerToken: string;
  private baseUrl: URL;
  static readonly TIMEOUT_MS: number = 300000;

  private static getOverrideOrEnv(
    overrideValue: string | undefined,
    envName: string
  ): string {
    if (overrideValue) {
      return overrideValue;
    } else {
      const envValue = process.env[envName];
      if (!envValue) {
        throw new Error(`${envName} is not set`);
      }
      return envValue;
    }
  }

  public constructor(
    ledgerConnectUrl: string | undefined = undefined,
    bearerToken: string | undefined = undefined,
    oauthConnectionUrlTemplate: string | undefined = undefined,
    exportTransactionUrlTemplate: string | undefined = undefined,
    baseUrl: string | undefined = undefined
  ) {
    const connectUrl = PropioLedgersMicroservice.getOverrideOrEnv(
      ledgerConnectUrl,
      "PROPIO_LEDGERS_URL"
    );
    this.ledgerConnectUrl = new URL(connectUrl);

    this.bearerToken = PropioLedgersMicroservice.getOverrideOrEnv(
      bearerToken,
      "PROPIO_LEDGERS_BEARER_TOKEN"
    );

    // This is a template URL that will be used to get the connection URL for a ledger, by replacing the ledger_id
    this.oauthLedgerConnectUrlTemplate =
      PropioLedgersMicroservice.getOverrideOrEnv(
        oauthConnectionUrlTemplate,
        "PROPIO_LEDGERS_OAUTH_GET_CONNECTION_URL_TEMPLATE"
      );
    this.exportTransactionUrlTemplate =
      PropioLedgersMicroservice.getOverrideOrEnv(
        exportTransactionUrlTemplate,
        "PROPIO_LEDGERS_EXPORT_SINGLE_TRANSACTION_URL_TEMPLATE"
      );
    // Base URL
    const baseUrlOption = PropioLedgersMicroservice.getOverrideOrEnv(
      baseUrl,
      "PROPIO_LEDGERS_BASE_URL"
    );
    this.baseUrl = new URL(baseUrlOption);
  }

  public async getLedgerConnectionUrl(
    ledger_id: number,
    client_id: number
  ): Promise<URL> {
    logger.info(`getLedgerConnectionUrl: ${ledger_id}, ${client_id}`);
    // We have two different ledger connection URL endpoints, one for QuickBooks and one for Xero.
    // Xero is implemented as a generic endpoint that takes the ledger_id as a parameter.
    // We will later unify QuickBooks with the same endpoint for consistency.
    switch (ledger_id) {
      case SupportedLedgers.QuickBooks:
        return await this.getLedgerConnectionUrlQuickBooks(client_id);
      case SupportedLedgers.Xero:
        return await this.getLedgerConnectionUrlInternal(ledger_id, client_id);
      default:
        throw new Error(`Unsupported ledger_id ${ledger_id}`);
    }
  }

  private async getLedgerConnectionUrlInternal(
    ledger_id: number,
    client_id: number
  ): Promise<URL> {
    const replacedUrl = this.oauthLedgerConnectUrlTemplate
      .toString()
      .replace("{ledger_id}", ledger_id.toString());
    const targetUrl = new URL(replacedUrl);
    targetUrl.searchParams.append("client_id", client_id.toString());
    logger.info(`getLedgerConnectionUrlInternal: ${targetUrl.toString()}`);
    try {
      const complete = await superagent
        .get(targetUrl.toString())
        .redirects(0)
        .auth(this.bearerToken, { type: "bearer" })
        .timeout(PropioLedgersMicroservice.TIMEOUT_MS)
        .ok((res) => res.status == 200);

      const responeData = JSON.parse(complete.text);
      const redirUrl = new URL(responeData.url);
      return redirUrl;
    } catch (e) {
      logger.error(`HTTP request failed with HTTP ${e.status}`);

      let result: any;
      try {
        result = JSON.parse(e?.response?.text);
      } catch (e) {
        logger.error("Could not parse error.");
        logger.error(e);
        throw e;
      }

      logger.error(`Error: ${result.message}`);
      throw new Error(`${result.message}`);
    }
  }

  private async getLedgerConnectionUrlQuickBooks(
    clientId: number
  ): Promise<URL> {
    const targetUrl = new URL(this.ledgerConnectUrl.toString());
    targetUrl.searchParams.append("client_id", clientId.toString());
    try {
      const complete = await superagent
        .get(targetUrl.toString())
        .redirects(0)
        .timeout(PropioLedgersMicroservice.TIMEOUT_MS)
        .ok((res) => res.status == 302);

      const redirUrl = new URL(complete.headers["location"]);
      return redirUrl;
    } catch (e) {
      logger.error(`HTTP request failed with HTTP ${e.status}`);

      let result: any;
      try {
        result = JSON.parse(e?.response?.text);
      } catch (e) {
        logger.error("Could not parse error.");
        logger.error(e);
        throw e;
      }

      logger.error(`Error: ${result.message}`);
      throw new Error(`${result.message}`);
    }
  }

  private handleRequestError(e: any): Error {
    logger.error(
      `Ledgers microservice HTTP request failed with status_code=${e.status}`
    );

    let result: any;
    try {
      result = JSON.parse(e?.response?.text);
    } catch (e) {
      logger.error("Could not parse error, throwing the raw error.");
      logger.error(e);
      return e;
    }

    logger.error(`Ledgers Microservice Error: ${result.message}`);
    return new Error(`${result.message}`);
  }

  public async exportTransactionToLedger(
    ledger_id: number,
    request: ExportingTransactionRequest
  ): Promise<ExportingTransactionResponse> {
    const replacedUrl = this.exportTransactionUrlTemplate.replace(
      "{ledger_id}",
      ledger_id.toString()
    );

    logger.info(
      `Calling the ledger microservice for transaction: ${request.transaction.transaction_id}`
    );
    logger.info(`Request: ${JSON.stringify(request)}`);

    const targetUrl = new URL(replacedUrl);

    try {
      const complete = await superagent
        .post(targetUrl.toString())
        .auth(this.bearerToken, { type: "bearer" })
        .timeout(PropioLedgersMicroservice.TIMEOUT_MS)
        .ok((res) => res.status == 200)
        .send(request);

      if (complete.ok) {
        logger.info(
          `Ledger categorization microservice response was OK, body is : ${JSON.stringify(
            complete.body
          )}`
        );
        return complete.body;
      } else {
        // NOTE: Exception thrown here will be caught in the catch in this method
        throw new Error(complete.text);
      }
    } catch (e) {
      throw this.handleRequestError(e);
    }
  }

  public async exportTransferToLedger(
    ledgerId: number,
    request: ExportingTransferRequest
  ): Promise<ExportingTransferResponse> {
    const replacedUrl = new URL(
      `/ledgers/${ledgerId}/export_single_transfer`,
      this.baseUrl.toString()
    );
    logger.info(`Calling the ledger microservice for transfer`, {
      url: replacedUrl.toString(),
      request: request,
    });

    try {
      const complete = await superagent
        .post(replacedUrl.toString())
        .auth(this.bearerToken, { type: "bearer" })
        .timeout(PropioLedgersMicroservice.TIMEOUT_MS)
        .ok((res) => res.status == 200)
        .send(request);

      if (complete.ok) {
        logger.info(
          `Ledger transfer microservice response was OK, body is : ${JSON.stringify(
            complete.body
          )}`
        );
        return complete.body;
      } else {
        // NOTE: Exception thrown here will be caught in the catch in this method
        throw new Error(complete.text);
      }
    } catch (e) {
      throw this.handleRequestError(e);
    }
  }

  public async refreshChartOfAccounts(
    ledger_connection: LedgerConnection
  ): Promise<void> {
    const replacedUrl = new URL(
      `/ledgers/${ledger_connection.ledger_id}/refresh_chart_of_accounts`,
      this.baseUrl.toString()
    );

    logger.info(
      `Calling the ledger microservice for Chart of Accounts Refresh`,
      {
        url: replacedUrl.toString(),
        request: ledger_connection,
      }
    );

    try {
      const complete = await superagent
        .post(replacedUrl.toString())
        .auth(this.bearerToken, { type: "bearer" })
        .timeout(PropioLedgersMicroservice.TIMEOUT_MS)
        .ok((res) => res.status == 200)
        .send(ledger_connection);

      if (complete.ok) {
        logger.info(
          `Ledger Chart of Accounts Refrsh microservice response was OK, body is : ${JSON.stringify(
            complete.body
          )}`
        );
        return;
      } else {
        // NOTE: Exception thrown here will be caught in the catch in this method
        throw new Error(complete.text);
      }
    } catch (e) {
      throw this.handleRequestError(e);
    }
  }
}
