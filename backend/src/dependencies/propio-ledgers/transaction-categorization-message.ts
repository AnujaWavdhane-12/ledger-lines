import { TransactionCategorizationRequest } from "@/models/sdk/models";
import { z } from "zod";

export interface TransactionCategorizationMessage {
  request: TransactionCategorizationRequest;
  partner_id: number;
}

const TransactionCategorizationRequestSchema = z.object({
  ledger_id: z.number(),
  transaction_id: z.number(),
  category_id: z.number(),
});

// all properties are required by default
export const TransactionCategorizationMessageSchema = z.object({
  request: TransactionCategorizationRequestSchema,
  partner_id: z.number(),
});
