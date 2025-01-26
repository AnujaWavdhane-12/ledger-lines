/**
 * Represents a transfer request to be exported to a ledger
 *
 * This class should be equal to the ExportingTransferResponse type found at:
 * lana/backend/functions/lana/models/ledgers/exporting_transfer_response.py
 */
export interface ExportingTransferResponse {
  /** Identifier of the source transaction exported */
  exported_source_transaction_id: string;

  /** Identifier of the destination transaction exported */
  exported_destination_transaction_id: string;

  /** Identifier of the transfer exported */
  exported_transfer_id: string;
}
