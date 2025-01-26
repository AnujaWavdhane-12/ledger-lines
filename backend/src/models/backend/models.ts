/**
 * These are models specific to the backend. Don't use these to return data or read data from the
 * REST API. In fact, most of these should only be used to talk to the Database.
 */

import { LedgerAccount } from "../sdk/ledgerAccount";
import { Transaction } from "../sdk/transaction";
import { SupportedLedgers } from "./supported-ledgers";
export { SupportedLedgers } from "./supported-ledgers";


export interface Organization {
    organization_id?: number;
    name?: string;
    web_url?: string | undefined;
    logo_url?: string | undefined;
    industry?: string;
}


export enum PreferredCommunication {
    EMAIL = 'Email',
    SMS = 'SMS',
    WHATSAPP = 'WhatsApp',
}


export interface QuickBooksLedgerAccount extends LedgerAccount {
    qbo_realm_id: string;
}

/**
 * A transaction in the Propio Universe
 */
export interface PropioTransaction extends Transaction {
    partner_id: number;
    batch_id: string | null;
    item_id: string | null;
    account_id: string | null;
    mask: string | null;
    client_id: number;
}



export interface ConenctedLedger {
    ledger_company_id: string;
    ledger_id: SupportedLedgers;
}
