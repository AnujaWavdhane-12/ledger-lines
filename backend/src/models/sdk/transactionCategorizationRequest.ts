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

/**
 * Transaction Categorization request
 */
export interface TransactionCategorizationRequest { 
    /**
     * Transaction ID in Propio Universe
     */
    transaction_id: number;
    /**
     * Ledger ID to push the transaction to
     */
    ledger_id: number;
    /**
     * Transaction Category ID
     */
    category_id: number;
    /**
     * ID of the transaction related to the primary transaction denoted by transaction_id
     */
    paired_transaction_id?: number;
}