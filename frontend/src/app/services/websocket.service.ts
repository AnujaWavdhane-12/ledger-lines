import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Transaction } from 'src/service-sdk';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws: WebSocket;

  // Some subscribers just want to get notified once
  private subscriptions: Map<string, Function[]>;

  // Some subscribers want to get notified any time there is any update
  private indefiniteSubscriptions: Map<string, Function[]>;

  /**
   * Create a new WebSocketService and connect to the websocket server.
   */
  constructor() {
    this.subscriptions = new Map();
    this.indefiniteSubscriptions = new Map();

    // TODO: Don't connect right now
    //this.connect();
  }

  connect() {
    this.ws = new WebSocket(environment.websocketUrl);
    console.log('Connected to websocket server:', environment.websocketUrl);

    this.ws.onmessage = this.dispatchMessage.bind(this, this.ws);

    this.ws.onclose = (s) => {
      // if the websocket connection is closed, try to reconnect unless we are closing on purpose
      console.log('Reconnecting to websocket server in .5 seconds');
      setTimeout(() => {
        this.connect();
      }, 500);
    };

    this.ws.onerror = (e) => {
      console.log('ws errored out', e);
    };
  }

  /**
   * Subscribe to changes in a transaction. When a message is received, the callback
   * function will be called with the message as an argument.
   *
   * @param transactionId The transaction ID to subscribe to
   * @param callback The function to call when a message is received
   */
  public async subscribeToChangesInTransaction(
    transactions: Transaction[],
    callback: (message: any, transactionId: number, isTimeout?: boolean) => void
  ): Promise<void> {
    console.log(`Subscribing to changes in ${transactions.length} transactions`, transactions);

    // Return a promise that resolves when the message is sent
    await new Promise<void>((resolve, reject) => {
      try {
        this.ws.send(JSON.stringify({ action: 'subscribeToTransaction', transaction_id: transactions.map((t) => t.transaction_id) }));

        for (let i = 0; i < transactions.length; i++) {
          const transaction = transactions[i];
          if (!this.subscriptions.has(transaction.transaction_id.toString())) {
            this.subscriptions.set(transaction.transaction_id.toString(), []);
          }

          this.subscriptions.get(transaction.transaction_id.toString()).push(callback);
        }

        const TIMEOUT_MS = 25 * 1000;
        setTimeout(() => {
          console.log('Timeout! Calling heartbeat');
          this.heartbeat();
        }, TIMEOUT_MS);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Runs every 5 seconds if there are messages in the this.subscriptions queue
  private heartbeat() {
    console.log('Heartbeat started');
    if (this.subscriptions.size === 0) {
      return;
    }

    // call the callback functions
    this.subscriptions.forEach((callbacks, key) => {
      callbacks.forEach((callback) => {
        console.log('Transaction timed out:', key);

        // At some point we should remove this key from subscriptions, only until
        // we have a fallback mechanism
        // this.subscriptions.delete(key);

        callback(null, Number(key), true);
      });
    });
  }

  /**
   * Subscribe to ANY changes in a transaction. When a message is received, the callback
   * function will be called with the message as an argument. This subscription will not
   * end after the first callback.
   *
   * @param transactionId The transaction ID to subscribe to
   * @param callback The function to call when a message is received
   */
  public async subscribeToChangesInTransactionIndefinitely(transactionId: number, callback: (message: any) => void): Promise<void> {
    console.log(`Indefinitely Subscribing to changes in transaction:`, transactionId);
    this.ws.send(JSON.stringify({ action: 'subscribeToTransaction', transaction_id: transactionId }));

    if (!this.indefiniteSubscriptions.has(transactionId.toString())) {
      this.indefiniteSubscriptions.set(transactionId.toString(), []);
    }

    this.indefiniteSubscriptions.get(transactionId.toString()).push(callback);
  }

  /**
   * The internal routing function for when the websocket server sends a message.
   *
   */
  private dispatchMessage = async (socket: WebSocket, ev: MessageEvent) => {
    let eventInformation: any;
    try {
      eventInformation = JSON.parse(ev.data);
    } catch (e) {
      console.error('Error parsing message from websocket server:', e);
      return;
    }

    if (eventInformation.transactionId === undefined) {
      console.log("There is no transactionId in the message, so we can't route it.", eventInformation);
      return;
    }

    const transactionId = eventInformation.transactionId;
    console.log('Dispatching message for transaction:', transactionId, eventInformation);

    // Notice indefinite subscriptions don't get removed
    if (this.indefiniteSubscriptions.has(transactionId.toString())) {
      this.indefiniteSubscriptions.get(transactionId.toString()).forEach((callback) => {
        callback(eventInformation);
      });
    }

    if (this.subscriptions.has(transactionId.toString())) {
      this.subscriptions.get(transactionId.toString()).forEach((callback) => {
        callback(eventInformation, transactionId);

        // Remove the subscription
        this.subscriptions.delete(transactionId.toString());
      });
    }

    // // After you've called all the callbacks, you can remove the subscription

    if (!this.indefiniteSubscriptions.has(transactionId.toString())) {
      // No one left to notify, so unsubscribe from the server
      this.ws.send(JSON.stringify({ action: 'unsubscribeFromTransaction', transaction_id: transactionId }));
    }
  };

  /**
   * Close the websocket connection.
   */
  public close(): void {
    console.log('Closing websocket connection');
    this.ws.close();
  }
}
