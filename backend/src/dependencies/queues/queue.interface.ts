/**
 * An interface that all queue connections must implement.
 */
export interface IQueueProvider {
  delete(queueUrl: string, message): Promise<any>;
  peek(queueUrl: string): Promise<any>;
  queues(queueUrl: string): Promise<any>;
  insert(queueUrl: string, id, message): Promise<any>;
}
