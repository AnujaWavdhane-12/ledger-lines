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
import { Organization } from './organization';

/**
 * Details of this client
 */
export interface Client { 
    accounting_start_date?: string;
    preferred_communication?: string;
    profile_image?: string;
    whatsapp_phone_number?: string;
    first_name?: string;
    email?: string;
    last_name?: string;
    phone?: string;
    organization: Organization;
    /**
     * The unique id of this client.
     */
    client_id?: number;
    partner_uid?: number;
    /**
     * Minimum, inclusive confidence level to push AI-categorized transactions automatically. If not set, automatic categorization is disabled. Ranges from 0 to 10.
     */
    transaction_suggestion_confidence_threshold?: number;
}