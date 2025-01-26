import { IDatabase, Row } from "../dependencies/database.interface";
import {
  PropioTransaction,
  QuickBooksLedgerAccount,
  SupportedLedgers,
} from "../models/backend/models";
import { Transaction } from "../models/sdk/transaction";
import { logger } from "../dependencies/logger";
import { LedgerAccount } from "@/models/sdk/ledgerAccount";
import {
  BadRequestException,
  ForbiddenException,
  GenericException,
  MappingNotFoundException,
  NotFoundException,
} from "../dependencies/exceptions";
import { ExportingTransaction } from "../dependencies/propio-ledgers/exporting-transaction";
import { ExportingTransactionRequest } from "../dependencies/propio-ledgers/exporting-transaction-request";
import { LedgerAccountTarget } from "../dependencies/propio-ledgers/ledger-account-target";
import { PropioAiCategorizationMicroservice } from "../dependencies/propio-ai/propio-ai";
import { PropioLedgersMicroservice } from "../dependencies/propio-ledgers/propio-ledgers";
import { TransactionCategorizationRequest } from "@/models/sdk/transactionCategorizationRequest";
import { AccountingController } from "./accounting";
import { ExportingTransferRequest } from "../dependencies/propio-ledgers/exporting-transfer-request";
import { stringToSupportedLegder } from "../models/backend";

export class TransactionsController {
  private conn: IDatabase;

  constructor(conn: IDatabase) {
    if (!conn) {
      throw Error("No db connection");
    }
    this.conn = conn;
  }

  /**
   * Get the chart of accounts for a given organization.
   *
   * @param organizationId
   * @returns
   */
  public async getChartOfAccounts(
    organizationId: number
  ): Promise<LedgerAccount[]> {
    const query = `SELECT
      propio_qbo_accounts.transaction_category_id,
      propio_qbo_accounts.account_id,
      propio_qbo_accounts.account_name,
      propio_qbo_companies.ledger_id,
      propio_qbo_accounts.ledger_account_data,
      propio_qbo_accounts.account_type,
      propio_qbo_accounts.account_sub_type
    FROM propio_clients
    INNER JOIN propio_qbo_accounts
      ON propio_qbo_accounts.qbo_realm_id = propio_clients.qbo_realm_id
    INNER JOIN propio_qbo_companies
      ON propio_qbo_companies.qbo_realm_id = propio_clients.qbo_realm_id
    WHERE
        propio_clients.organization_id = $1
    AND propio_qbo_accounts.active = true
    ORDER BY
      propio_qbo_accounts.account_name ASC;`;

    const results = await this.conn.execute(query, [organizationId]);

    // Turn the results into a typed array
    const typedResults = results.rows.map(
      AccountingController.rowToLedgerAccount
    );

    return typedResults;
  }

  /**
   * Create a new client, and it's organization, always.
   *
   * @param client Client data, with organization data
   *
   * @returns ID of the newly created client
   */
  public async getTransactions(clientId: number): Promise<Transaction[]> {
    // The regexp_replace function is used to remove extra spaces from the account_friendly_name
    // This applies in the case where the institution name, account name, and mask are all empty
    const query = `
      SELECT *
      FROM propio_transactions
      WHERE client_id = $1
      ORDER BY transaction_id DESC`;

    const results = await this.conn.execute(query, [clientId]);

    const finalResults = results.rows.map((result: Row) => {
      let ledgerId = -1;

      if (result["ledger_id"]) {
        switch (result["ledger_id"]) {
          case "Xero":
            ledgerId = SupportedLedgers.Xero;
            break;
          case "QuickBooks":
            ledgerId = SupportedLedgers.QuickBooks;
            break;
        }
      }

      const transaction = {
        transaction_id: parseInt(result["transaction_id"]),
        date: result["date"],
        amount: result["amount"],
        categorization_status: result["categorization_status"],
        city_state: result["city_state"],
        transaction_category_id: result["transaction_category_id"],
        feedback_requests: result["feedback_requests"],
        logo_url: result["logo_url"],
        merchant_name: result["merchant_name"],
        original_description: result["original_description"],
        account_friendly_name: result["account_friendly_name"],
        plaid_transaction_id: result["plaid_transaction_id"],
        qbo_realm_id: result["qbo_realm_id"],
        ledger_transaction_id: result["qbo_doc_number"],
        ledger_id: ledgerId,
        ai_suggestion: {
          suggestion_id: result["suggestion_id"],
          category_id: result["ai_suggested_category_id"],
          reasoning: result["ai_reasoning"],
          confidence_level: result["ai_confidence_level"],
        },
        suggestion_confidence_level:
          result["ai_confidence_level"] ||
          result["suggestion_confidence_level"],
        suggestion_transaction_category_id:
          result["ai_suggested_category_id"] ||
          result["suggestion_transaction_category_id"],
      } as Transaction;

      return transaction;
    });

    logger.info(`read ${finalResults.length} transactions `);
    return finalResults;
  }

  /**
   * Gets a single transaction by the propio id.
   *
   * @param transactionId Transaction ID
   * @returns a PropioTransaction object (Transaction + Internal database data)
   */
  public async getTransaction(
    transactionId: number
  ): Promise<PropioTransaction> {
    const query = `SELECT
      pt.transaction_id,
      pt.date,
      pt.amount,
      pt.categorization_status,
      pt.city_state,
      pt.transaction_category_id,
      pt.suggestion_confidence_level,
      pt.suggestion_transaction_category_id,
      pt.feedback_requests,
      pt.logo_url,
      pt.merchant_name,
      pt.original_description,
      TRIM(regexp_replace(
          CONCAT(ins.name, ' ', plaid_acc.name, ' ',
                CASE WHEN plaid_acc.mask IS NULL THEN '' ELSE CONCAT('*', plaid_acc.mask) END),
          ' +',
          ' ',
          'g'
      )) as account_friendly_name,
      pt.plaid_transaction_id,
      pc.qbo_realm_id,
      pt.partner_id,
      pt.batch_id,
      plaid_acc.item_id,
      pt.qbo_doc_number,
      plaid_acc.mask,
      pt.account_id,
      pt.client_id,
      propio_qbo_companies.ledger_id
    FROM propio_transactions pt
    INNER JOIN propio_clients pc ON pt.client_id = pc.client_id
    LEFT OUTER JOIN propio_plaid_accounts plaid_acc ON pt.account_id = plaid_acc.account_id
    LEFT OUTER JOIN propio_plaid_items item ON item.item_id = plaid_acc.item_id
    LEFT OUTER JOIN propio_plaid_institutions ins ON ins.institution_id = item.institution_id
    LEFT OUTER JOIN propio_qbo_accounts qbo_acc ON pt.transaction_category_id = qbo_acc.transaction_category_id and pc.qbo_realm_id = qbo_acc.qbo_realm_id
    LEFT OUTER JOIN propio_qbo_companies ON pc.qbo_realm_id = propio_qbo_companies.qbo_realm_id
    WHERE
      pt.transaction_id = $1
    AND
      date >= pc.accounting_start_date
    LIMIT 1`;

    const results = await this.conn.execute(query, [transactionId]);

    if (results.rows.length === 0) {
      throw new NotFoundException(
        `No transaction found for transaction_id: ${transactionId}`
      );
    }
    const row = results.rows[0];

    return {
      transaction_id: row["transaction_id"],
      date: row["date"],
      amount: row["amount"],
      categorization_status: row["categorization_status"],
      city_state: row["city_state"],
      transaction_category_id: row["transaction_category_id"],
      suggestion_transaction_category_id:
        row["suggestion_transaction_category_id"],
      feedback_requests: row["feedback_requests"],
      logo_url: row["logo_url"],
      merchant_name: row["merchant_name"],
      original_description: row["original_description"],
      account_friendly_name: row["account_friendly_name"],
      plaid_transaction_id: row["plaid_transaction_id"],
      qbo_realm_id: row["qbo_realm_id"],
      partner_id: row["partner_id"],
      batch_id: row["batch_id"],
      item_id: row["item_id"],
      ledger_transaction_id: row["qbo_doc_number"],
      mask: row["mask"],
      account_id: row["account_id"],
      client_id: row["client_id"],
      ledger_id: stringToSupportedLegder(row["ledger_id"]),
    };
  }

  /**
   * Categorizes the transaction with the given category on a ledger.
   *
   * @param request Transaction Cateogorization Request
   * @param partnerId The partner ID of the user categorizing the transaction
   */
  public async categorizeTransaction(
    categorizationRequest: TransactionCategorizationRequest,
    partnerId: number,
    ledgersMicroservice: PropioLedgersMicroservice,
    telemetryContext: any
  ): Promise<void> {
    logger.info(
      `Categorizing transaction ${categorizationRequest.transaction_id} started.`
    );

    // Are we using a supported ledger?
    switch (categorizationRequest.ledger_id) {
      case SupportedLedgers.QuickBooks:
        telemetryContext.ledger = "QuickBooks";
        logger.info(`Ledger is QuickBooks`);
        break;

      case SupportedLedgers.Xero:
        telemetryContext.ledger = "Xero";
        logger.info(`Ledger is Xero`);
        break;

      default:
        telemetryContext.ledger = "Unsupported ledger";
        throw new BadRequestException("Unsupported ledger");
    }

    // TODO: Make sure the transaction belongs to a client that has the ledger connected.

    // We are ready to categorize the transaction.
    try {
      await this.conn.query("BEGIN TRANSACTION", []);

      if (categorizationRequest.paired_transaction_id) {
        await this.categorizeLedgerTransferInternal(
          categorizationRequest,
          partnerId,
          ledgersMicroservice,
          telemetryContext
        );
      } else {
        await this.categorizeLedgerTransactionInternal(
          categorizationRequest,
          partnerId,
          ledgersMicroservice,
          telemetryContext
        );
      }

      await this.conn.query("COMMIT TRANSACTION", []);
      logger.info(
        `Categorized transaction: ${categorizationRequest.transaction_id}`
      );
    } catch (e) {
      logger.error(`Error while categorizing transaction: ${e.toString()}`, {
        error: e,
      });
      await this.conn.query("ROLLBACK TRANSACTION", []);
      throw e;
    } finally {
      logger.info(
        `Categorizing transaction ${categorizationRequest.transaction_id} completed.`
      );
    }
  }

  /**
   * Throw an exception if the account is not valid for categorizing the transaction.
   *
   * @param account Account to validate
   * @param transaction Transaction to categorize with the account
   * @param ledger Supported ledger
   */
  private validateLedgerAccount(
    account: QuickBooksLedgerAccount,
    transaction: PropioTransaction,
    ledger: SupportedLedgers
  ) {
    if (!account.qbo_realm_id) {
      throw new BadRequestException("No ledger_connection_id");
    }
    if (!account.account_id) {
      throw new BadRequestException("No account_id");
    }
    if (!account.name) {
      throw new BadRequestException("No account_name");
    }
    if (ledger == SupportedLedgers.QuickBooks) {
      if (!account.ledger_account_data["AccountType"]) {
        throw new BadRequestException("No QuickBooks AccountType");
      }
      if (!account.ledger_account_data["AccountSubType"]) {
        throw new BadRequestException("No QuickBooks AccountSubType");
      }
    }
    if (account.qbo_realm_id !== transaction.qbo_realm_id) {
      throw new ForbiddenException(
        "The account does not belong to the same ledger as the transaction"
      );
    }
  }

  /**
   * Throw an exception if the transaction is not valid for categorizing.
   *
   * @param transactionInDb Transaction to validate
   */
  private validateTransaction(transactionInDb: PropioTransaction) {
    if (!transactionInDb.plaid_transaction_id) {
      throw new GenericException("No plaid_transaction_id");
    }
    if (!transactionInDb.amount) {
      throw new BadRequestException("Amount is required");
    }
    if (!transactionInDb.date) {
      throw new BadRequestException("Date is required");
    }
    if (!transactionInDb.original_description) {
      throw new BadRequestException("Original description is required");
    }
    if (!transactionInDb.transaction_id) {
      throw new BadRequestException("Transaction ID is required");
    }
    if (!transactionInDb.item_id || !transactionInDb.batch_id) {
      throw new BadRequestException(
        "Exporting user-entered transactions is not supported"
      );
    }
    logger.info(
      `Plaid transaction found, batch_id=${transactionInDb.batch_id}, item_id=${transactionInDb.item_id}, transaction_id=${transactionInDb.transaction_id}`
    );
  }

  /**
   * Takes a PropioTransaction object and creates an ExportingTransaction object.
   *
   * @param transaction a PropioTransaction object
   * @returns an ExportingTransaction object
   *
   * @throws BadRequestException if any required fields are missing
   */
  private createExportingTransactionObject(
    transaction: PropioTransaction
  ): ExportingTransaction {
    if (!transaction.amount) {
      throw new BadRequestException("Amount is required");
    }
    if (!transaction.date) {
      throw new BadRequestException("Date is required");
    }
    if (!transaction.original_description) {
      throw new BadRequestException("Original description is required");
    }
    if (!transaction.transaction_id) {
      throw new BadRequestException("Transaction ID is required");
    }

    return {
      amount: Number.parseFloat(transaction.amount),
      date: transaction.date,
      description: transaction.original_description,
      transaction_id: transaction.transaction_id,
      merchant_name: transaction.merchant_name,
      ledger_transaction_data: {
        // This is needed for QuickBooks
        qbo_realm_id: transaction.qbo_realm_id,
      },
    };
  }

  /**
   * Takes a ledger account object and creates a LedgerAccountTarget object for QuickBooks.
   *
   * @param account a LedgerAccount object from database
   * @returns a LedgerAccountTarget object ready to be sent to Ledgers microservice
   *
   * @throws BadRequestException if any required fields are missing
   */
  private createLedgerAccountTargetQuickBooks(
    account: QuickBooksLedgerAccount
  ): LedgerAccountTarget {
    logger.info(`Creating ledger account for QuickBooks`);
    if (!account.name) {
      throw new BadRequestException("No account_name");
    }

    return {
      account_name: account.name,
      ledger_account_data: account.ledger_account_data,
    };
  }

  /**
   * Takes a ledger account object and creates a LedgerAccountTarget object for Xero.
   *
   * @param account a LedgerAccount object from database
   * @returns a LedgerAccountTarget object ready to be sent to Ledgers microservice
   *
   * @throws BadRequestException if any required fields are missing
   */
  private createLedgerAccountTargetXero(
    account: QuickBooksLedgerAccount
  ): LedgerAccountTarget {
    logger.info(`Creating ledger account for Xero`);
    if (!account.name) {
      throw new BadRequestException("No account_name");
    }

    const ledger_account_target = {
      account_name: account.name,
      ledger_account_data: account.ledger_account_data,
    };

    return ledger_account_target;
  }

  /**
   * Get the target account for the ledger microservice.
   *
   * @param account Ledger account object
   * @param ledger Supported ledger
   *
   * @returns a LedgerAccountTarget object
   *
   * @throws BadRequestException if the ledger is not supported
   */
  private getLedgerAccountTarget(
    account: QuickBooksLedgerAccount,
    ledger: SupportedLedgers
  ): LedgerAccountTarget {
    switch (ledger) {
      case SupportedLedgers.Xero:
        return this.createLedgerAccountTargetXero(account);
      case SupportedLedgers.QuickBooks:
        return this.createLedgerAccountTargetQuickBooks(account);
      default:
        throw new BadRequestException("Unsupported ledger");
    }
  }

  private async getDefaultSourceLedgerAccount(
    bankAccountId: string | null,
    clientId: number
  ): Promise<LedgerAccountTarget> {
    if (!bankAccountId) {
      throw new BadRequestException("No account_id");
    }

    const accountingController = new AccountingController(this.conn);

    const bankAccount = await accountingController.getPlaidAccountForClient(
      clientId,
      bankAccountId
    );

    return {
      account_name: bankAccount.account_name,
      ledger_account_data: {
        plaid_account: bankAccount,
      },
    };
  }

  /**
   * Gets the mapped ledger account for the given transaction for the source account.
   *
   * @param accountId Bank accountId for the transaction, from Plaid
   * @param clientId Client ID that is related to the transaction
   *
   * @returns a LedgerAccountTarget object if a mapping is found
   *
   * @throws BadRequestException if the accountId or clientId is missing
   * @throws MappingNotFoundException if no mapping is found
   */
  private async getMappedLedgerAccount(
    accountId: string | null,
    clientId: number,
    ledger: SupportedLedgers
  ): Promise<LedgerAccountTarget> {
    if (!accountId) {
      throw new BadRequestException("No account_id");
    }
    if (!clientId) {
      throw new BadRequestException("No client_id");
    }

    const mappingQuery = `SELECT
      acc.account_name as ledger_account_name,
      acc.account_type as ledger_account_type,
      acc.account_sub_type as ledger_account_sub_type,
      map.ledger_account_id
  FROM
    propio_bank_to_account_map map
  INNER JOIN
    propio_qbo_accounts acc ON map.ledger_account_id = acc.transaction_category_id
  WHERE
    map.client_id = $1::integer AND map.plaid_account_id = $2::text`;
    logger.info(
      `Checking for mapping for bank account: ${accountId} for client: ${clientId}`
    );

    const mappings = await this.conn.execute(mappingQuery, [
      clientId,
      accountId,
    ]);

    if (mappings.rows.length === 1) {
      const mapping = mappings.rows[0];
      logger.info(
        `Mapping found for bank account: ${accountId} to ledger account: ${mapping.ledger_account_name}`
      );

      const mapped_ledger_account = await this.getLedgerAccount(
        mapping.ledger_account_id
      );
      const mapped_target_account = this.getLedgerAccountTarget(
        mapped_ledger_account,
        ledger
      );

      return mapped_target_account;
    }

    throw new MappingNotFoundException("No mapping found for bank account");
  }

  private async updateTransactionCategory(
    transactionId: number,
    categoryId: number
  ): Promise<void> {
    const query = `UPDATE propio_transactions
    SET transaction_category_id = $1
    WHERE transaction_id = $2`;

    await this.conn.execute(query, [categoryId, transactionId]);
    logger.info(
      `Updated transaction id=${transactionId} category in the DB to: ${categoryId}`
    );
  }

  private async updateTransactionStatusToValidated(
    partnerId: number,
    ledgerTransactionId: string,
    transactionId: number
  ) {
    if (!ledgerTransactionId) {
      throw new BadRequestException("No ledger_transaction_id");
    }
    if (!transactionId) {
      throw new BadRequestException("No transaction_id");
    }
    if (!partnerId) {
      throw new BadRequestException("No partner_id");
    }

    const categorization_status = "Validated";
    const updateQuery = `UPDATE
      propio_transactions
    SET
      categorization_status = $1, categorized_by = $2, qbo_doc_number = $3
    WHERE
      transaction_id = $4`;
    await this.conn.execute(updateQuery, [
      categorization_status,
      partnerId,
      ledgerTransactionId,
      transactionId,
    ]);
    logger.info(
      `Updated transaction id=${transactionId} status in the DB to: ${categorization_status}`
    );
  }

  /**
   * Creates ledger connection data for transfers
   *
   * @param transaction Source transaction in transfer
   * @returns a dictionary with the ledger connection data
   */
  private async getLedgerConnectionData(
    transaction: Transaction,
    client_id: number
  ): Promise<{ [key: string]: any }> {
    switch (transaction.ledger_id) {
      case SupportedLedgers.QuickBooks:
        return {
          qbo_realm_id: transaction.qbo_realm_id,
        };
      case SupportedLedgers.Xero:
        return {
          client_id: client_id,
        };
      default:
        throw new BadRequestException(
          "Unsupported ledger: " + transaction.ledger_id
        );
    }
  }

  private async categorizeLedgerTransferInternal(
    request: TransactionCategorizationRequest,
    partnerId: number,
    ledgersMicroservice: PropioLedgersMicroservice,
    telemetryContext: any
  ): Promise<void> {
    logger.info("Categorizing transfer started", { request: request });

    if (!request.paired_transaction_id) {
      throw new BadRequestException("No paired_transaction_id");
    }

    if (request.transaction_id === request.paired_transaction_id) {
      throw new BadRequestException(
        "Transaction_id and paired_transaction_id cannot be the same"
      );
    }

    const source_transaction = await this.getTransaction(
      request.transaction_id
    );
    this.validateTransaction(source_transaction);
    const destination_transaction = await this.getTransaction(
      request.paired_transaction_id
    );
    this.validateTransaction(destination_transaction);

    if (source_transaction.client_id !== destination_transaction.client_id) {
      throw new BadRequestException(
        "Transactions do not belong to the same client"
      );
    }

    const source_account = await this.getSourceLedgerAccount(
      source_transaction.account_id,
      source_transaction.client_id,
      request.ledger_id
    );
    const destination_account = await this.getLedgerAccount(
      request.category_id
    );

    this.validateLedgerAccount(
      destination_account,
      source_transaction,
      request.ledger_id
    );
    const ledger_connection_data = await this.getLedgerConnectionData(
      source_transaction,
      source_transaction.client_id
    );

    // Construct the request
    const transfer_request: ExportingTransferRequest = {
      transaction_source:
        this.createExportingTransactionObject(source_transaction),
      transaction_destination: this.createExportingTransactionObject(
        destination_transaction
      ),
      source_account: source_account,
      destination_account: this.getLedgerAccountTarget(
        destination_account,
        request.ledger_id
      ),
      ledger_connection_data: ledger_connection_data,
    };

    const ledger_response = await ledgersMicroservice.exportTransferToLedger(
      request.ledger_id,
      transfer_request
    );
    logger.info(
      `Ledger transfer microservice returned: ${JSON.stringify(
        ledger_response
      )}`
    );

    // We will allow overwrites in transfers

    // Update both transactions category and status in the database
    this.updateTransactionCategory(request.transaction_id, request.category_id);
    this.updateTransactionStatusToValidated(
      partnerId,
      ledger_response.exported_source_transaction_id,
      request.transaction_id
    );

    // TODO: Find a way to update the destination transaction category when there is no mapping
    this.updateTransactionCategory(
      request.paired_transaction_id,
      request.category_id
    );
    this.updateTransactionStatusToValidated(
      partnerId,
      ledger_response.exported_destination_transaction_id,
      request.paired_transaction_id
    );

    telemetryContext.transfer_request = transfer_request;
    telemetryContext.client_id = source_transaction.client_id;
    telemetryContext.partner_id = partnerId;

    logger.info(
      `Transaction ${request.transaction_id} and ${request.paired_transaction_id} categorized as transfer`
    );
  }

  /**
   * Get the source ledger account for the transaction, either from the mapping or the default account.
   *
   * @param accountId Plaid account ID
   * @param clientId Client ID related to the account
   * @param ledgerId Ledger ID related to the account
   *
   * @returns  LedgerAccountTarget object
   */
  private async getSourceLedgerAccount(
    accountId: string | null,
    clientId: number,
    ledgerId: SupportedLedgers
  ): Promise<LedgerAccountTarget> {
    if (!accountId) {
      throw new BadRequestException("No account_id");
    }
    if (!clientId) {
      throw new BadRequestException("No client_id");
    }
    if (!ledgerId) {
      throw new BadRequestException("No ledger_id");
    }

    let source_bank_account: LedgerAccountTarget | null = null;

    try {
      // Try first with mapping
      source_bank_account = await this.getMappedLedgerAccount(
        accountId,
        clientId,
        ledgerId
      );
    } catch (e) {
      if (e instanceof MappingNotFoundException) {
        logger.info(`No mapping`, {
          account_id: accountId,
          client_id: clientId,
        });
        // Get default account data from the database
        source_bank_account = await this.getDefaultSourceLedgerAccount(
          accountId,
          clientId
        );
      } else {
        throw e;
      }
    }

    if (!source_bank_account) {
      throw new BadRequestException("No source account found");
    }
    return source_bank_account;
  }

  /**
   * Actual implementation of categorizing the transaction.
   *
   * @param body the transaction request details
   * @param partnerId The partner ID of the user categorizing the transaction
   * @param ledgersMicroservice The ledger microservice to categorize the transaction
   * @param telemetryContext An object that will be sent out as the custom telemetry context
   */
  private async categorizeLedgerTransactionInternal(
    request: TransactionCategorizationRequest,
    partnerId: number,
    ledgersMicroservice: PropioLedgersMicroservice,
    telemetryContext: any
  ): Promise<void> {
    logger.info("Categorizing transaction started", { request: request });
    // Get transaction data
    const transactionInDb = await this.getTransaction(request.transaction_id);
    this.validateTransaction(transactionInDb);
    logger.info(
      `Found transaction in the DB: ${transactionInDb.transaction_id}`
    );

    // /////////////////////////////////////////////////////////////////
    // Target account: Get account data from the database
    // /////////////////////////////////////////////////////////////////
    const target_account_db = await this.getLedgerAccount(request.category_id);
    this.validateLedgerAccount(
      target_account_db,
      transactionInDb,
      request.ledger_id
    );

    // Set category in database
    await this.updateTransactionCategory(
      request.transaction_id,
      request.category_id
    );

    const source_bank_account = await this.getSourceLedgerAccount(
      transactionInDb.account_id,
      transactionInDb.client_id,
      request.ledger_id
    );

    const target_account = this.getLedgerAccountTarget(
      target_account_db,
      request.ledger_id
    );

    const transaction_payload =
      this.createExportingTransactionObject(transactionInDb);

    // Add exisiting id to ask for an update
    if (transactionInDb.ledger_transaction_id) {
      transaction_payload.ledger_transaction_data["ledger_transaction_id"] =
        transactionInDb.ledger_transaction_id;
    }

    // /////////////////////////////////////////////////////////////////
    // We are ready to call the ledger microservice.
    //
    // Build the request and call the microservice.
    // /////////////////////////////////////////////////////////////////
    const exporting_transaction_request: ExportingTransactionRequest = {
      source_account: source_bank_account,
      category_account: target_account,
      client_id: transactionInDb.client_id,
      transaction: transaction_payload,
    };

    logger.info(
      `Contents of the exporting_transaction_request object:`,
      exporting_transaction_request
    );

    telemetryContext.source_account = source_bank_account.account_name;
    telemetryContext.target_account = target_account;
    telemetryContext.client_id = transactionInDb.client_id;

    // Call Export ledgers microservice to update the transaction
    const response = await ledgersMicroservice.exportTransactionToLedger(
      request.ledger_id,
      exporting_transaction_request
    );
    logger.info(
      "Ledger categorization microservice returned: ",
      response.exported_transaction_id
    );

    /*
     * If the transaction was already exported to a different document number via another system
     * or if there's a ledgers microservice implementation error causing different document numbers,
     * we should not update the database
     */
    if (
      transactionInDb.ledger_transaction_id &&
      transactionInDb.ledger_transaction_id !== response.exported_transaction_id
    ) {
      throw new BadRequestException(
        "Transaction already exported to a different document number"
      );
    }

    // /////////////////////////////////////////////////////////////////
    //  End: Save the results
    // /////////////////////////////////////////////////////////////////
    // Save export results
    this.updateTransactionStatusToValidated(
      partnerId,
      response.exported_transaction_id,
      request.transaction_id
    );
  }

  /**
   * Get a ledger account from the database
   *
   * @param categoryId Transaction category ID
   *
   * @returns a QuickBooksLedgerAccount object
   */
  private async getLedgerAccount(
    categoryId: number
  ): Promise<QuickBooksLedgerAccount> {
    const query = `SELECT
      propio_qbo_accounts.qbo_realm_id,
      propio_qbo_accounts.transaction_category_id,
      propio_qbo_accounts.account_id,
      propio_qbo_accounts.account_name,
      propio_qbo_accounts.account_type,
      propio_qbo_accounts.account_sub_type,
      propio_qbo_accounts.ledger_account_data,
      propio_qbo_companies.ledger_id
    FROM propio_qbo_accounts
    INNER JOIN propio_qbo_companies
      ON propio_qbo_companies.qbo_realm_id = propio_qbo_accounts.qbo_realm_id
    WHERE
        propio_qbo_accounts.transaction_category_id = $1
    LIMIT 1`;
    const results = await this.conn.execute(query, [categoryId]);
    if (results.rows.length === 0) {
      throw Error(
        `No account data found for transaction_category_id: ${categoryId}`
      );
    }
    const row = results.rows[0];
    const account = AccountingController.rowToLedgerAccount(row);

    return {
      qbo_realm_id: row["qbo_realm_id"],
      category_id: account.category_id,
      account_id: account.account_id,
      name: account.name,
      ledger_account_data: account.ledger_account_data,
      ledger_id: account.ledger_id,
      is_transfer_compatible: account.is_transfer_compatible,
      type: account.type,
      sub_type: account.sub_type,
    };
  }

  /**
   * Create a new transaction
   *
   * @param transaction Transaction data
   *
   * @param partnerId
   * @param clientId
   * @returns ID of the newly created transaction
   */
  public async createTransaction(
    transaction: Transaction,
    partnerId: number,
    clientId: number
  ): Promise<number> {
    try {
      logger.info("Creating transaction", {
        transaction: transaction,
        type: `${typeof transaction}`,
      });

      await this.conn.execute("BEGIN TRANSACTION", []);

      if (!transaction.merchant_name) {
        throw new BadRequestException("Merchant name is required");
      }

      if (!transaction.amount) {
        throw new BadRequestException("Amount is required");
      }

      transaction.categorization_status = "Pending";

      const insertTransactionQuery = `INSERT INTO propio_transactions
      (
        merchant_name,
        date,
        amount,
        original_description,
        categorization_status,
        pending,
        is_in_quickboks,
        is_in_quickbooks,
        client_id,
        partner_id
      )
    VALUES ($1, $2, $3, $4, $5, FALSE, FALSE, FALSE, ${clientId}, ${partnerId}) RETURNING transaction_id AS id`;

      const result = await this.conn.execute(insertTransactionQuery, [
        transaction.merchant_name,
        transaction.date,
        transaction.amount,
        transaction.original_description,
        transaction.categorization_status,
      ]);

      await this.conn.execute("COMMIT TRANSACTION", []);

      logger.info("Transaction created with ID: " + result, {
        transaction_id: result,
      });

      return result.lastInsertedId;
    } catch (e) {
      logger.error(`Error creating transaction: ${e.toString()}`, {
        error: e,
        stack: e.stack,
      });
      await this.conn.execute("ROLLBACK TRANSACTION", []);
      throw e;
    }
  }

  /**
   * Request that a transaction be suggested
   */
  public async requestSuggestion(transactionId: number): Promise<void> {
    // Make an HTTP call to the AI categorization service
    // to request a suggestion for the transaction
    const aiService = new PropioAiCategorizationMicroservice();
    await aiService.requestSuggestion(transactionId);
  }
}
