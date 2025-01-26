import { PlaidAccountType } from "../../dependencies/propio-ledgers/plaid-account-type";
import { PlaidAccountSubType } from "../../dependencies/propio-ledgers/plaid-account-subtype";

/** 
 * Represents a bank account that is connected via Plaid
 * 
 * Must be the same as the PlaidAccountExtract class in:
 * $repoRoot/lana/backend/functions/lana/ledgers/plaid_account_extract.py
 */
export class PlaidAccountExtract {
  /**
   * Account ID from Plaid
   * @example "vzeNDwK7KQIm4yEog683uElbp9GRLEFXGK98D"
   */
  account_id: string;

  /**
   * The name of the account, friendly to the user
   * @example "Platypus Bank - Plaid Checking *1234"
   */
  account_name: string;

  /**
   * The type of the account
   * @example "Depository"
   */
  type: PlaidAccountType;

  /**
   * The subtype of the account
   * @example "Checking"
   */
  subtype: PlaidAccountSubType;

  /**
   * Last 4 digits of the account number
   * @example "6789"
   */
  mask: string;
}
