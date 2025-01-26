/**
 * Represents a transaction to be exported to a Ledger.
 *
 * This class should be equal to the ExportingTransaction type found at:
 *
 * $repoRoot/lana/backend/functions/lana/models/ledgers/exporting_transaction.py
 */
export interface ExportingTransaction {
  /** Transaction amount */
  amount: number;

  /** Transaction date YYYY-MM-DD */
  date: string;

  /** Transaction description */
  description: string;

  /** Transaction ID in Propio */
  transaction_id: number;

  /** Merchant name */
  merchant_name?: string;

  /** Ledger specific transaction data, useful for recategorization */
  ledger_transaction_data: { [key: string]: any };
}
