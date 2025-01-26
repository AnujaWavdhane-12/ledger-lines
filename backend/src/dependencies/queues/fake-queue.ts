//
// Fake in-memory queue for unit testing purposes
//
import { IQueueProvider } from "./queue.interface";

export default class FakeQueue implements IQueueProvider {
  private innerQueue: any[] = [];

  public async delete(queueUrl: string, message): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }

  public async peek(queueUrl: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(this.innerQueue.pop());
    });
  }

  public async queues(queueUrl: string): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }

  public async insert(queueUrl: string, id, message): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.innerQueue.push(message);
      resolve();
    });
  }

  // This is the structure of a "real" event
  public sqsMessage = {
    messageId: "3d6dbc7b-eee8-432d-8c3c-51a4410028cb",
    receiptHandle:
      "AQEB/SNuKskpuyDSvX4GNicaCGHcLAhf05m2V8oJBWMm9sQ1hGsFFUufL9B0ljW1boP/VKw/78Kpwqemd0PplBmLvxL4HuKfOg9+d25VSI1WbweJ39yd52ZaQpG9txUHSXSUSmLk6G/LnSMGPQz8axU5SKkamPWrWQHB9TOdZiGlI/4FFA1ri4pih0jrFPIAsb9z+V/ze15lY7y53aISj7kbsZGKkLVdtMH8jtKL5nckDlVbKcFD1UwGiEUYIhyXv5PHlvtW3BEhVMbRAPwrLZDo7Q==",
    body: " bestseller for week of 12/11/2016.",
    attributes: {
      ApproximateReceiveCount: "1",
      SentTimestamp: "1658420612543",
      SequenceNumber: "18871299750520561152",
      MessageGroupId: "Group1",
      SenderId: "700223578739",
      MessageDeduplicationId: "TheWhistler2",
      ApproximateFirstReceiveTimestamp: "1658420612543",
    },
    messageAttributes: {
      WeeksOn: {
        stringValue: "6",
        stringListValues: [],
        binaryListValues: [],
        dataType: "Number",
      },
      Author: {
        stringValue: "John Grisham",
        stringListValues: [],
        binaryListValues: [],
        dataType: "String",
      },
      Title: {
        stringValue: "The Whistler",
        stringListValues: [],
        binaryListValues: [],
        dataType: "String",
      },
    },
    md5OfMessageAttributes: "d25a6aea97eb8f585bfa92d314504a92",
    md5OfBody: "d2b8a629e11740113c1356f6bf4385a6",
    eventSource: "aws:sqs",
    eventSourceARN: "arn:aws:sqs:us-west-2:700223578739:turing-dev.fifo",
    awsRegion: "us-west-2",
  };
}
