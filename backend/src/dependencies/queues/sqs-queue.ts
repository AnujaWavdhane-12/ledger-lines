//
// AWS Simple Queue Service Adapter
//
import { IQueueProvider } from "./queue.interface";
import {
  SQSClient,
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  ReceiveMessageCommand,
  QueueAttributeName,
  ListQueuesCommand,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";

import { logger } from "./../logger";

/**
 * A class to interact with AWS SQS.
 */
export default class SQSQueue implements IQueueProvider {
  private sqs: SQSClient;

  private init() {
    this.sqs = new SQSClient({ apiVersion: "2012-11-05", region: "us-west-2" });
  }

  public async delete(queueUrl: string, message): Promise<any> {
    this.init();

    const deleteParams: DeleteMessageCommandInput = {
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle,
    };
    await this.sqs.send(new DeleteMessageCommand(deleteParams));

    logger.info("Message Deleted", deleteParams);
  }

  public async peek(queueUrl: string): Promise<any> {
    this.init();

    const params = {
      AttributeNames: [QueueAttributeName.CreatedTimestamp],
      MaxNumberOfMessages: 1,
      MessageAttributeNames: ["All"],
      QueueUrl: queueUrl,
      VisibilityTimeout: 3 * 60,
      WaitTimeSeconds: 0,
    };

    const data = await this.sqs.send(new ReceiveMessageCommand(params));
    return data.Messages;
  }

  public async queues(queueUrl: string): Promise<any> {
    this.init();

    const params = {};
    const data = await this.sqs.send(new ListQueuesCommand(params));
    logger.info("Listed queues successfully", data.QueueUrls);
    return data.QueueUrls;
  }

  public async insert(queueUrl: string, id, message): Promise<any> {
    this.init();

    const params = {
      MessageAttributes: {},
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl,
    };

    const data = await this.sqs.send(new SendMessageCommand(params));
    logger.info(
      "Successfully inserted a new mesage. Message id is = " + data.MessageId
    );
    return data.MessageId;
  }
}
