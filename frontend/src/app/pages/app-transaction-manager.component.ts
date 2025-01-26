import { Component, OnInit } from '@angular/core';
import { Client, DefaultService, LedgerAccount, Transaction, User } from 'src/service-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { MomentPipe } from '../components/date.pipe.component';
import { LocalStorageService } from '../services/local-storage.service';
import { WebSocketService } from '../services/websocket.service';
import { PostHogService } from '../services/posthog.service';
import moment from 'moment';

@Component({
  selector: 'app-transaction-manager-component',
  styles: [
    `
      h3 {
        padding: 0;
        margin-bottom: 0;
      }
      .spacer {
        margin-top: 20px;
      }
      :host ::ng-deep .positive {
        color: green;
      }
      :host ::ng-deep .negative {
        color: red;
      }
      :host ::ng-deep .p-selectbutton.p-buttonset {
        padding-left: 5px;
      }
      :host ::ng-deep .p-button {
        padding: 8px;
      }
      .right-align {
        text-align: end;
      }
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .p-toolbar-group-end {
        gap: 1rem;
      }
      .stats {
        font-size: 1rem;
        color: #666;
      }
    `,
  ],
  providers: [MessageService, MomentPipe],
  template: `
    <p-toast></p-toast>
    <dashboard-page-component [title]="'Transactions'">
      <h3>Transactions</h3>
      <span class="stats">
        Total Transactions: {{ this.transactions?.length ?? 0 }}, Pending: {{ pendingTransactionsCount ?? 0 }}, Suggested:
        {{ suggestedTransactionsCount ?? 0 }}, Uncategorized: {{ uncategorizedTransactionsCount ?? 0 }}
      </span>

      <p-toolbar>
        <div class="p-toolbar-group-start">
          <client-dropdown-component [clients]="clients" (onDataChange)="selectedClient($event)"></client-dropdown-component>

          <p-selectButton
            [options]="categoryOptions"
            (onChange)="filterTransactions()"
            [(ngModel)]="selectedCategoryStatus"
            [multiple]="false"
            optionLabel="name"
            optionValue="value"></p-selectButton>

          <!-- This feature is not ready.
          <p-button (click)="toggleNewTransactionModal()" icon="pi pi-plus" label="New"></p-button>
            -->
        </div>

        <div class="p-toolbar-group-end">
          <p-button
            label="Export"
            [disabled]="(this.filteredTransactions?.length ?? 0) == 0"
            (onClick)="exportCSV()"
            icon="pi pi-download"
            class="p-button-success"></p-button>

          <p-button
            label="Categorize {{ this.selectedTransactions?.length ?? 0 }} as..."
            [disabled]="this.selectedTransactions?.length == 0"
            (onClick)="toggleBulkCategorizationDialog()"></p-button>

          <p-button
            label="AI Suggest {{ this.selectedTransactions?.length ?? 0 }}"
            [disabled]="this.selectedTransactions?.length == 0"
            (onClick)="requestSuggestion(this.selectedTransactions)"
            icon="pi pi-bolt"></p-button>

          <p-button
            label="Save {{ this.selectedTransactions?.length ?? 0 }}"
            [disabled]="disabledSaveTransactionsButton"
            (onClick)="saveTransactions()"
            icon="pi pi-save"
            class="p-button-success"></p-button>
        </div>
      </p-toolbar>

      <!--
      This feature is not ready.
      <transaction-create-component
        [client]="selectedTransactionClient"
        [chartOfAccounts]="chartOfAccounts"
        (onDataChange)="refreshTable()"
        [(visible)]="showNewTransactionModal"></transaction-create-component>
        -->
      <transaction-create-transfer-component
        [sourceTransaction]="transferSourceTransaction"
        [client]="selectedTransactionClient"
        [chartOfAccounts]="chartOfAccounts"
        [transactions]="transactions"
        (onDataChange)="refreshTable()"
        [(visible)]="showNewTransferModal"></transaction-create-transfer-component>

      <bulk-categorization-dialog-component
        [(visible)]="showBulkCategorizationDialog"
        [categories]="chartOfAccounts"
        (categorySelected)="setCategory($event)"></bulk-categorization-dialog-component>

      <div class="spacer"></div>

      <app-transactions-table-component
        [(updatedTransactions)]="updatedTransactions"
        [(selectedTransactions)]="selectedTransactions"
        [chartOfAccounts]="chartOfAccounts"
        (initiatedTransfer)="initiatedTransfer($event.transaction_id, $event.category_id)"
        (aiCategorizationRequested)="requestAiCategorization($event)"
        (onSelectionChange)="onSelectionChange()"
        [transactionsBeingUpdated]="transactionsBeingUpdated"
        [loading]="isLoadingTransactions"
        [transactions]="filteredTransactions"
        [selectedCategoryStatus]="selectedCategoryStatus"></app-transactions-table-component>
    </dashboard-page-component>
  `,
})
export class TransactionManagerComponent implements OnInit {
  // The organization ID of the selected client in the dropdown, OR
  // the organization ID from the URL.
  private clientId: number;

  //
  //
  //                        /------------------------------------------------- this.transactionsBeingUpdated
  //                       /                                                          ^
  // REST API -> this.transactions -> this.filteredTransactions -> Table  -> this.updatedTransactions
  //                                        ^
  //                                  this.selectedCategoryStatus
  //

  // Filtered transactions are those displayed in the table. This is filtered by the selected category.
  protected filteredTransactions = [];

  // Transactions TODO: change this to Transaction
  protected transactions: any[] = [];

  protected disabledSaveTransactionsButton = true;

  protected clients = [];
  private partnerId: number;
  protected userDetails: User;

  protected selectedTransactionClient: Client;
  protected transferSourceTransaction: Transaction;
  protected isLoadingTransactions = false;
  protected selectedCategoryStatus: 'Pending';
  protected showNewTransactionModal = false;
  protected showNewTransferModal = false;
  protected showPushToLedgerPaywall = false;
  protected chartOfAccounts: LedgerAccount[];
  protected updatedTransactions: Transaction[] = [];
  protected pendingTransactionsCount = 0;
  protected suggestedTransactionsCount = 0;
  protected uncategorizedTransactionsCount = 0;
  protected transactionsBeingUpdated: Set<number> = new Set();
  protected validatedTransactionCount = 0;
  protected selectedTransactions: Transaction[] = [];
  protected showBulkCategorizationDialog = false;

  protected categoryOptions: any[] = [
    { name: 'Pending', value: 'Pending' },
    // Uncategorized is no longer valid as it used to be. Keeping it here
    // since it's still a valid value, but this will likely go away.
    //{ name: 'Uncategorized', value: 'Unvalidated' },
    { name: 'Categorized', value: 'Validated' },
    { name: 'Feedback Requested', value: 'FeedbackRequested' },
    //{ name: 'Excluded', value: 'Excluded' },
  ];

  public constructor(
    @Inject(DOCUMENT)
    public doocument: Document,
    private api: DefaultService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private posthogService: PostHogService,
    private webSocketService: WebSocketService
  ) {
    this.userDetails = new Object() as User;
    this.route.params.subscribe((params) => {
      if (params.clientId) {
        this.clientId = params.clientId;
      }
    });

    this.titleService.setTitle('Transactions | LedgerLines');
  }

  public ngOnInit() {
    // Load the clients, so that we can show the dropdown.
    this.api.getClients(0, 100).subscribe({
      next: (response) => {
        this.isLoadingTransactions = false;
        this.clients = response;

        //if (this.clientId && this.clients.length > 0) {
        //  // We suppose the users able to see the defualt client's transaction page.
        //  this.selectedTransactionClient = this.clients.find((client) => client.organization.organization_id === this.organizationId);
        //}
      },
      error: (error) => {
        // Unable to load clients.
        console.error('Unable to load clients');
        console.error(error);
      },
    });

    // If we landed here because an organization was provided via the URL,
    // immediately load the transactions for that organization.
    if (this.clientId) {
      console.log('Loading organization from URL', this.clientId);
      this.loadOrganization(this.clientId);
    }

    this.selectedCategoryStatus = 'Pending';
  }

  protected initiatedTransfer(transaction_id, category_id) {
    const sourceTransaction = this.transactions.find((t) => t.transaction_id === transaction_id);
    this.transferSourceTransaction = sourceTransaction;
    this.transferSourceTransaction.transaction_category_id = category_id;
    this.showNewTransferModal = true;
  }

  protected filterTransactions() {
    this.filteredTransactions = this.transactions;
  }

  /**
   * Load organization details which includes transactions and the chart of accounts.
   *
   * @param partnerId The current partner ID using this interface.
   * @param organizationId The organization of the client whose transactions we want to load.
   */
  public loadOrganization(clientId: number) {
    let partnerId: number = 0, 
      organizationId: number = 0;

    this.isLoadingTransactions = true;

    this.api.getTransactionsForClient(clientId).subscribe((transactions) => {
      this.transactions = transactions.map((item) => ({
        ...item,
      }));

      this.isLoadingTransactions = false;
      this.filterTransactions();
    });

    this.api.getLedgerChartOfAccounts(partnerId, organizationId, 1).subscribe((chartOfAccounts) => {
      const emptyOption: LedgerAccount = {
        category_id: null,
        account_id: 'no-account',
        name: '[Select an account]',
        is_transfer_compatible: false,
        type: '?',
        sub_type: '?',
        ledger_account_data: {},
        ledger_id: -1,
      }; // revise this part when done
      this.chartOfAccounts = [emptyOption, ...chartOfAccounts];
    });
  }

  protected refreshTable() {
    this.loadOrganization(this.selectedTransactionClient.client_id);
  }

  protected selectedClient(client: Client) {
    if (client) {
      this.selectedTransactionClient = client;

      this.router.navigate(['/clients', client.client_id, 'transactions']);
      this.loadOrganization(client.client_id);
    } else {
      // Clear the tables.
      this.router.navigate(['/transactions']);
    }
  }

  protected exportCSV() {
    // Not implemented
  }

  protected onSelectionChange() {
    this.disabledSaveTransactionsButton = this.selectedTransactions.length === 0;
  }

  /**
   * Replace a transaction in the "main" transactions array.
   *
   * @param transaction The transaction to replace in the array.
   */
  private replaceTransactionInArray(transaction: Transaction) {
    const index = this.transactions.findIndex((t) => t.transaction_id === transaction.transaction_id);
    if (index !== -1) {
      this.transactions[index] = transaction;
    }

    this.filterTransactions();
  }

  protected async saveTransactions() {
    // NOt implemtented
  }

  /**
   *
   * @param transactions The transactions to request AI categorization for.
   */
  public requestAiCategorization(transactions: Transaction[]) {
    console.log('Requesting AI suggestion for transactions', transactions);

    // TODO: Revisit this. The reason we are using a NEW Set when updating this, is because
    // we need to trigger the change detection in Angular. If we just update the existing
    // Set, Angular doesn't detect the change and doesn't update the UI.
    const newMap = new Set<number>(this.transactionsBeingUpdated);
    transactions.forEach((elem) => {
      newMap.add(elem.transaction_id);
      const transaction = [
        {
          transaction_id: elem.transaction_id,
        },
      ] as Transaction[];

      this.webSocketService.subscribeToChangesInTransaction(transaction, (updateEvent) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'AI suggesion complete.' });
        this.transactionsBeingUpdated.delete(elem.transaction_id);

        if (updateEvent.suggestedCategoryId) {
          // The category has changed
          // find the transaction in filtered transactions
          const transaction: Transaction = this.transactions.find((t) => t.transaction_id === elem.transaction_id);
          transaction.suggestion_transaction_category_id = updateEvent.suggestedCategoryId;

          this.filterTransactions();
        }
      });

      this.api.suggestCategoryForTransaction(elem.transaction_id).subscribe({
        next: () => {},
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `There was an error on AI suggestion for transaction ${elem.transaction_id}. Please try again.`,
          });
          console.error(error);
        },
      });
    });

    this.transactionsBeingUpdated = newMap;
  }

  protected toggleNewTransactionModal() {
    if (!this.selectedTransactionClient && this.clients.length > 0) {
      this.selectedTransactionClient = this.clients[0];
    }
    this.showNewTransactionModal = !this.showNewTransactionModal;
  }

  protected toggleBulkCategorizationDialog() {
    this.showBulkCategorizationDialog = true;
  }

  protected setCategory(category: LedgerAccount) {
    const categoryIdString = category.category_id.toString();
    this.selectedTransactions.forEach((transaction) => {
      console.log(`Setting transaction ${transaction.transaction_id} to category_id ${categoryIdString}`);
      // TODO: Change the Transaction API to be this a number, not a string.
      transaction.transaction_category_id = category.category_id as any;
    });
  }

  protected requestSuggestion(transactions: Transaction[]) {
    this.requestAiCategorization(transactions);
  }
}
