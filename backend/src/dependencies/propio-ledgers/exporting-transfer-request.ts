import { ExportingTransaction } from "./exporting-transaction";
import { LedgerAccountTarget } from "./ledger-account-target";

/**
 * Represents a transfer request to be exported to a ledger
 *
 * Same as the ExportingTransferRequest type found at:
 * $repoRoot/lana/backend/functions/lana/models/ledgers/exporting_transfer_request.py
 */
export interface ExportingTransferRequest {
  /** Transaction with the origin of the transfer */
  transaction_source: ExportingTransaction;

  /** Transaction with the destination of the transfer */
  transaction_destination: ExportingTransaction;

  /** Ledger account that represents the source of the transfer */
  source_account: LedgerAccountTarget;

  /** Ledger account that represents the destination of the transfer */
  destination_account: LedgerAccountTarget;

  /** Connection data to guide the export */
  ledger_connection_data: { [key: string]: any };
}
