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
 * A bank account that has been connected (usually via Plaid)
 */
export interface BankAccount { 
    plaid_account_id?: string;
    name?: string;
}