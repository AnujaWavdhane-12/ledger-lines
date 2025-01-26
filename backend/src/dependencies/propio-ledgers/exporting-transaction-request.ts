import { LedgerAccountTarget } from "./ledger-account-target";
import { ExportingTransaction } from "./exporting-transaction";

export interface ExportingTransactionRequest {
  /** Transaction to export */
  transaction: ExportingTransaction;

  /** Account to export transaction to */
  category_account: LedgerAccountTarget;

  /** Propio Client ID */
  client_id: number;

  /** Account to export transaction from */
  source_account: LedgerAccountTarget;
}
