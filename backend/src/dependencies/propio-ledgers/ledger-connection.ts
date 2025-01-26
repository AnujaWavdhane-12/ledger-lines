import { SupportedLedgers } from "@/models/backend";

/**
 * A connection between a client to a ledger
 *
 * For now, this class maps rows in table in propio_qbo_companies. We wil change this later once we decouple
 * the ledger connection from the company
 *
 * This class should be equal to the LedgerConnection type found at:
 *
 * $repoRoot/backend/src/dependencies/propio-ledgers/exporting-transaction.ts
 */
export interface LedgerConnection {
  /**
   * Identifier of the ledger connection, assigned by the database
   *
   * @example 123456
   */
  ledger_connection_id: number;

  /**
   * Identifier of ledger for this connection
   *
   * @example 1 (SupportedLegers.QuickBooks)
   */
  ledger_id: SupportedLedgers;

  /**
   * Ledger-specific data for this connection
   */
  ledger_data: { [key: string]: any };
}
