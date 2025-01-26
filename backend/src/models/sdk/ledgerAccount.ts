/**
 * Propio API
 * Microservice for partner managment
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { LedgerAccountData } from './ledgerAccountData';

export interface LedgerAccount { 
    /**
     * The Propio's ID of the account. Numeric.
     */
    category_id: number;
    /**
     * The ledger's account ID. Can be a string.
     */
    account_id: string;
    /**
     * Account name
     */
    name: string;
    /**
     * Set to true if this account can be used to categorize a transaction as a transfer, generally, bank accounts
     */
    is_transfer_compatible: boolean;
    /**
     * Account type, level 1 in account hierarchy 
     */
    type: string;
    /**
     * Account sub type, level 2 in account hierarchy. Recommended for display purposes
     */
    sub_type: string;
    ledger_account_data: LedgerAccountData;
    /**
     *  Ledger Identifier supported in Propio
     */
    ledger_id: number;
}