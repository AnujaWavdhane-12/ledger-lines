import { IDatabase, Row } from "../dependencies/database.interface";
import {
  BadRequestException,
  GenericException,
  NotFoundException,
} from "../dependencies/exceptions";
import { logger } from "../dependencies/logger";
import { BankAccountMapping } from "@/models/sdk/bankAccountMapping";
import { PlaidAccountExtract } from "@/models/backend/plaid-account-extract";
import { LedgerAccount } from "../models/sdk/ledgerAccount";
import {
  stringToSupportedLegder,
  SupportedLedgers,
} from "../models/backend/supported-ledgers";
import { LedgerAccountData } from "@/models/sdk/ledgerAccountData";
import { LedgerConnection } from "../dependencies/propio-ledgers/ledger-connection";

export class BankAccount {
  account_id: string;
  name: string;
}

export class AccountInChartOfAccounts {
  category_id: number;
  name: string;
  type: string;
  account_sub_type: string;
}

export class Mapping {
  bank_account: BankAccount;
  target_account: AccountInChartOfAccounts;
}

export class AccountingController {
  private conn: IDatabase;

  constructor(conn: IDatabase) {
    if (!conn) {
      throw Error("No db connection");
    }

    this.conn = conn;
  }

  public async getPlaidAccountForClient(
    clientId: number,
    bankAccountId: string
  ): Promise<PlaidAccountExtract> {
    const query = `SELECT 
        pa.account_id,
        regexp_replace(CONCAT(ins.name, ' ', pa.name, ' ', CASE WHEN pa.mask IS NULL THEN '' ELSE CONCAT('*', pa.mask) END), ' +', ' ', 'g') as account_friendly_name,
        pa.type,
        pa.subtype,
        pa.mask
      FROM propio_plaid_accounts pa
      INNER JOIN propio_plaid_items pi
        ON pa.item_id = pi.item_id 
      LEFT OUTER JOIN propio_plaid_institutions ins
        ON ins.institution_id = pi.institution_id
      WHERE pi.client_id = $1 and pa.account_id = $2`;

    const results = await this.conn.execute(query, [clientId, bankAccountId]);

    if (results.rows.length === 0) {
      throw new GenericException("Account not found");
    }

    if (results.rows.length > 1) {
      throw new GenericException("Multiple accounts found");
    }

    const row = results.rows[0];
    return {
      account_id: row.account_id,
      account_name: row.account_friendly_name,
      type: row.type,
      subtype: row.subtype,
      mask: row.mask,
    };
  }

  public async getBankAccountsForClient(
    clientId: number
  ): Promise<BankAccount[]> {
    const query = ` SELECT 
        propio_plaid_accounts.account_id,
        regexp_replace(CONCAT(propio_plaid_institutions.name, ' ', propio_plaid_accounts.name, ' ', CASE WHEN propio_plaid_accounts.mask IS NULL THEN '' ELSE CONCAT('*', propio_plaid_accounts.mask) END), ' +', ' ', 'g') as account_friendly_name
        FROM propio_plaid_accounts
        inner join propio_plaid_items on propio_plaid_accounts.item_id = propio_plaid_items.item_id 
        LEFT OUTER JOIN propio_plaid_institutions ON propio_plaid_institutions.institution_id = propio_plaid_items.institution_id
        where propio_plaid_items.client_id = $1 `;

    const results = await this.conn.execute(query, [clientId]);

    const bankAccounts: BankAccount[] = results.rows.map((row) => {
      return {
        account_id: row.account_id,
        name: row.account_friendly_name,
      };
    });

    return bankAccounts;
  }

  public async getChartOfAccountsForClient(
    clientId: number
  ): Promise<LedgerAccount[]> {
    const query = `SELECT
      propio_qbo_accounts.transaction_category_id,
      propio_qbo_accounts.account_id,
      propio_qbo_accounts.account_name,
      propio_qbo_accounts.account_type,
      propio_qbo_accounts.account_sub_type,
      propio_qbo_companies.ledger_id,
      propio_qbo_accounts.ledger_account_data
    FROM propio_qbo_accounts
    INNER JOIN propio_clients
      ON propio_qbo_accounts.qbo_realm_id = propio_clients.qbo_realm_id
    INNER JOIN propio_qbo_companies
      ON propio_qbo_accounts.qbo_realm_id = propio_qbo_companies.qbo_realm_id
    WHERE propio_clients.client_id = $1;`;

    const results = await this.conn.execute(query, [clientId]);
    const accounts: LedgerAccount[] = results.rows.map(
      AccountingController.rowToLedgerAccount
    );

    return accounts;
  }

  /**
   * This function will **DELETE ALL OF THE MAPPINGS** for a client, and restore them with the new mappings
   * in the passed array.
   *
   * @param clientId The client id
   * @param mapping The mapping to set
   */
  public async setBankAccountMappingsForClient(
    clientId: number,
    mappings: BankAccountMapping[]
  ): Promise<void> {
    logger.info(
      `Setting mappings for client ${clientId}, ${mappings.length} mappings`
    );

    try {
      // start a transaction
      await this.conn.execute("BEGIN", []);

      // delete all previous mappings
      const deleteQuery = `delete from propio_bank_to_account_map where client_id = $1;`;
      await this.conn.execute(deleteQuery, [clientId]);

      // now, iterate the mappings and build a query to insert all of them
      let query = `INSERT INTO propio_bank_to_account_map (plaid_account_id, ledger_account_id, client_id) values `;
      const values: any[] = [];
      for (let i = 0, j = 0; i < mappings.length; i++) {
        query += `($${++j}, $${++j}, $${++j}) ,`;

        values.push(mappings[i]?.plaid_account_id);
        values.push(mappings[i]?.ledger_account_id);
        values.push(clientId);
      }

      // remove the last comma and execute the transaction
      query = query.slice(0, -1);
      await this.conn.execute(query, values);

      // commit the transaction
      await this.conn.execute("COMMIT", []);
    } catch (e) {
      // rollback the transaction
      logger.error(e);
      await this.conn.execute("ROLLBACK", []);
      throw new GenericException("Could not delete old mappings");
    }
  }

  /**
   * Get a list of mappings for a given client. Not expanded, raw ids.
   *
   * @param clientId The client id
   * @returns
   */
  public async getBankAccountMappingsForClient(
    clientId: number
  ): Promise<any[]> {
    const query = `select * from propio_bank_to_account_map where client_id = $1;`;
    const results = await this.conn.execute(query, [clientId]);
    const mappings: any[] = results.rows.map((row) => {
      return {
        plaid_account_id: row.plaid_account_id,
        ledger_account_id: row.ledger_account_id,
      };
    });
    return mappings;
  }

  public async getLedgerConnectionByClientId(
    clientId: number
  ): Promise<LedgerConnection> {
    const query = `SELECT
      propio_qbo_companies.ledger_connection_id,
      propio_qbo_companies.ledger_data,
      propio_qbo_companies.qbo_realm_id,
      propio_qbo_companies.ledger_id
    FROM propio_qbo_companies
    INNER JOIN propio_clients ON propio_qbo_companies.qbo_realm_id = propio_clients.qbo_realm_id
    WHERE
      propio_clients.client_id = $1;`;

    const results = await this.conn.execute(query, [clientId]);

    if (results.rows.length === 0) {
      throw new NotFoundException("No ledger connection found");
    }

    if (results.rows.length > 1) {
      throw new GenericException("Multiple ledger connections found");
    }
    const row = results.rows[0];
    const ledger_id = stringToSupportedLegder(row.ledger_id);

    let ledger_data = row.ledger_data || {};
    switch (ledger_id) {
      case SupportedLedgers.Xero:
        ledger_data = {
          client_id: clientId,
          tenant_id: row.qbo_realm_id,
        };
        break;
      case SupportedLedgers.QuickBooks:
        ledger_data = {
          qbo_realm_id: row.qbo_realm_id,
        };
        break;
      default:
        throw new BadRequestException("Unsupported ledger: " + row.ledger_id);
    }

    return {
      ledger_connection_id: row.ledger_connection_id,
      ledger_data: ledger_data,
      ledger_id: stringToSupportedLegder(row.ledger_id),
    };
  }

  /**
   * Maps a row from propio_qbo_accounts table to a LedgerAccount object.
   *
   * @param row a row from propio_qbo_accounts table in database. Must contain the following fields:
   * - transaction_category_id
   * - account_id
   * - account_name
   * - ledger_id
   *
   * @param isTransferCompatible a boolean indicating if the account is transfer compatible
   * @param type a string representing the account type, for display purposes
   * @param sub_type a string representing the account sub type, for display purposes
   * @param ledger_account_data a LedgerAccountData object
   *
   * @returns LedgerAccount object
   *
   * @throws BadRequestException if any of the required fields are missing
   */
  public static createLedgerAccountObject(
    row: Row,
    isTransferCompatible: boolean,
    type: string,
    sub_type: string,
    ledger_account_data: LedgerAccountData
  ): LedgerAccount {
    if (!row["transaction_category_id"]) {
      throw new BadRequestException("Missing transaction_category_id");
    }
    if (!row["account_id"]) {
      throw new BadRequestException("Missing account_id");
    }
    if (!row["account_name"]) {
      throw new BadRequestException("Missing account_name");
    }
    if (!row["ledger_id"]) {
      throw new BadRequestException("Missing ledger_id");
    }

    return {
      category_id: row["transaction_category_id"],
      account_id: row["account_id"],
      name: row["account_name"],
      ledger_account_data: ledger_account_data,
      ledger_id: stringToSupportedLegder(row["ledger_id"]),
      is_transfer_compatible: isTransferCompatible,
      type: type,
      sub_type: sub_type,
    };
  }

  /**
   * Maps a row from propio_qbo_accounts table to a LedgerAccount object.
   *
   * @param row a row from propio_qbo_accounts table in database. Must contain the following fields:
   * - transaction_category_id
   * - account_id
   * - account_name
   * - ledger_id
   *
   * @returns a LedgerAccount object
   *
   * @throws BadRequestException if any of the required fields are missing
   */
  public static rowToLedgerAccount(row: Row): LedgerAccount {
    let is_transfer_compatible: boolean;
    let account_type: string;
    let account_sub_type: string;
    const ledger_id = stringToSupportedLegder(row["ledger_id"]);
    let ledger_account_data: LedgerAccountData;
    switch (ledger_id) {
      case SupportedLedgers.QuickBooks:
        is_transfer_compatible =
          row["account_type"] == "Bank" || row["account_type"] == "CreditCard";
        account_type = row["account_type"];
        account_sub_type = row["account_sub_type"];
        ledger_account_data = {
          AccountType: row["account_type"],
          AccountSubType: row["account_sub_type"],
        };
        break;
      case SupportedLedgers.Xero:
        is_transfer_compatible = row["ledger_account_data"]["Type"] == "BANK";
        account_type = AccountingController.mapXeroAccountClass(
          row["ledger_account_data"]["Class"]
        );
        account_sub_type = AccountingController.mapXeroToPropioAccountSubType(
          row["ledger_account_data"]["Type"],
          row["ledger_account_data"]["BankAccountType"]
        );
        ledger_account_data = row["ledger_account_data"];
        break;
      default:
        throw new BadRequestException(
          "Unsupported ledger: " + row["ledger_id"]
        );
    }
    const account = AccountingController.createLedgerAccountObject(
      row,
      is_transfer_compatible,
      account_type,
      account_sub_type,
      ledger_account_data
    );

    return account;
  }

  private static mapXeroToPropioAccountSubType(
    accountType: string,
    bankAccountType: string
  ): string {
    if (accountType === "BANK") {
      return AccountingController.mapXeroBankAccountType(bankAccountType);
    }

    return AccountingController.mapXeroAccountType(accountType);
  }

  private static mapXeroAccountType(xeroAccountType: string): string {
    switch (xeroAccountType) {
      case "BANK":
        return "Bank";
      case "CURRENT":
        return "Current Asset";
      case "CURRLIAB":
        return "Current Liability";
      case "DEPRECIATN":
        return "Depreciation";
      case "DIRECTCOSTS":
        return "Direct Costs";
      case "EQUITY":
        return "Equity";
      case "EXPENSE":
        return "Expense";
      case "FIXED":
        return "Fixed Asset";
      case "INVENTORY":
        return "Inventory Asset";
      case "LIABILITY":
        return "Liability";
      case "NONCURRENT":
        return "Non-current Asset";
      case "OTHERINCOME":
        return "Other Income";
      case "OVERHEADS":
        return "Overhead";
      case "PREPAYMENT":
        return "Prepayment";
      case "REVENUE":
        return "Revenue";
      case "SALES":
        return "Sale";
      case "TERMLIAB":
        return "Non-current Liability";
      default:
        throw new BadRequestException(
          "Unsupported Xero account type: " + xeroAccountType
        );
    }
  }

  private static mapXeroAccountClass(xeroAccountClass: string): string {
    switch (xeroAccountClass) {
      case "ASSET":
        return "Asset";
      case "EQUITY":
        return "Equity";
      case "EXPENSE":
        return "Expense";
      case "LIABILITY":
        return "Liability";
      case "REVENUE":
        return "Revenue";
      default:
        throw new BadRequestException(
          "Unsupported Xero account class: " + xeroAccountClass
        );
    }
  }

  private static mapXeroBankAccountType(xeroBankAccountType: string): string {
    switch (xeroBankAccountType) {
      case "BANK":
        return "Bank account";
      case "CREDITCARD":
        return "Credit Card";
      case "PAYPAL":
        return "PayPal";
      default:
        throw new BadRequestException(
          "Unsupported Xero bank account type: " + xeroBankAccountType
        );
    }
  }
}
