//
// This is an interface with the LLM models
//
import { OpenAI, OpenAICallOptions } from "@langchain/openai";

export class LangChain {
  private model: OpenAI<OpenAICallOptions>;

  public async call(prompt: string) {
    this.model = new OpenAI({
      // https://js.langchain.com/docs/api/llms_openai/classes/OpenAI
      // since we want the outputs to be MORE random, we'll initialize our model with a HIGH temperature.
      // closer to zero the less risks the model takes, thik of it as creativity
      temperature: 0.5,
      maxTokens: 3000,
      modelName: "gpt-4-0125-preview", // gpt-3.5-turbo
      // modelName
      // batchSize
      // n : Number of completions to generate for each prompt
      verbose: false,
    });

    const response = await this.model.invoke(prompt);
    return response;
  }
}
