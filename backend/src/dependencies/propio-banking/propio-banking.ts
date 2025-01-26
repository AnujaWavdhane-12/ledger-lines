import { logger } from "../logger";
import superagent from "superagent";

export class PropioBankingMicroservice {
  private baseUrl;
  static readonly TIMEOUT_MS: number = 300000;

  constructor() {
    // URL to the webservice, this will be something like:
    // https://us-west1-propio-dev.cloudfunctions.net/syncHandler/sync/links
    this.baseUrl = process.env.PROPIO_BANKING_URL;
  }

  private isRunningUnitTests() {
    return process.env.NODE_ENV && process.env.NODE_ENV === "test";
  }

  public async generateLink(
    partnerId: string,
    clientId: string
  ): Promise<string> {
    require("dotenv").config();

    if (this.isRunningUnitTests()) {
      throw new Error("Don't use real dependencies in UTs");
    }

    try {
      const options = {
        partner_id: partnerId,
        client_id: clientId,
      };

      logger.info(
        `Requesting link for partner ${partnerId} and client ${clientId}`
      );
      const complete = await superagent
        .post(this.baseUrl)
        .accept("json")
        .timeout(PropioBankingMicroservice.TIMEOUT_MS)
        .send(options);
      logger.info(`Call completed succesfully.`);

      const url = complete.body.data.link_url;
      logger.info(`Link generated: ${url}`);

      return url;
    } catch (e) {
      logger.error(`Call failed with with HTTP ${e.status}.`);

      // Try to extract the error
      let result: any;
      try {
        result = JSON.parse(e?.response?.text);
      } catch (e) {
        logger.error("Could not parse error.");
        logger.error(e);
        throw new Error("Could not generate a link.");
      }

      logger.error(`Error: ${result.message}`);
      throw new Error(result.message);
    }
  }
}
