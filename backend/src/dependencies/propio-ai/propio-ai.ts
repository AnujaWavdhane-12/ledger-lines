import { Transaction } from "../../models/sdk/transaction";
import { logger } from "../logger";
import superagent from "superagent";

/**
 * Client to communicate with Propio AI Categorization service.
 */
export class PropioAiCategorizationMicroservice {
  static readonly TIMEOUT_MS: number = 300000;

  public async requestSuggestion(transactionId: number): Promise<Transaction[]> {
    // This is the URL of the AI Categorization service
    logger.info(
      `Requesting AI categorization for transaction ${transactionId}`
    );

    const URL = 'http://localhost:3001/transactions'

    try {
      const response = await superagent
        .get(URL)
        .redirects(0)
        .timeout(PropioAiCategorizationMicroservice.TIMEOUT_MS)
        .ok((res) => res.status == 200);

      return response.body as Transaction[];

    } catch (e) {
      logger.error(`HTTP request failed with HTTP ${e.status}`);
      throw new Error(e);
    }
  }
}
