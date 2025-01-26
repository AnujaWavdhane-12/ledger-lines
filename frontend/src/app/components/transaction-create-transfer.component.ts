import { Component, Output, EventEmitter, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Client, DefaultService, LedgerAccount, Transaction, TransactionCategorizationRequest } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'transaction-create-transfer-component',
  template: `
    <p-dialog
      header="Header"
      [(visible)]="visible"
      (onHide)="visibilityChanged()"
      (onShow)="visibilityChanged()"
      [modal]="true"
      [style]="{ width: '75vw', height: '75vw' }">
      <ng-template pTemplate="header">
        <h5>Account Transfer - Select a Matching Transaction</h5>
        <br />
      </ng-template>
      <p>You are categorizing this as a transfer between accounts. To confirm this transaction, please select the matching transfer from the list below.</p>
      <pre pTooltip="{{ sourceTransaction?.transaction_id | json }}">
        {{ sourceTransaction?.date | dateObjectFormat }} - {{ sourceTransaction?.transaction_id }} - {{ sourceTransaction?.original_description }} - {{
          sourceTransaction?.amount | currency
        }}
      </pre
      >
      <p>If you don’t see the matching transaction, make sure it’s recorded in the receiving account or adjust the filters above.</p>

      <app-transactions-table-component
        [chartOfAccounts]="chartOfAccounts"
        [transactionsBeingUpdated]="transactionsBeingUpdated"
        [(selectedTransactions)]="selectedTransactions"
        (onSelectionChange)="onSelectionChange()"
        [transactions]="filteredTransactions"></app-transactions-table-component>

      <ng-template pTemplate="footer">
        <p-button icon="pi pi-check" [loading]="loading" (click)="createTransfer()" label="Confirm Match" styleClass=""></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class TransactionCreateTransferComponent implements OnInit, OnChanges {
  @Input() chartOfAccounts: LedgerAccount[];
  @Input() client: Client;
  @Input() transactions: any[];
  @Input() visible = false;
  @Input() sourceTransaction: Transaction;
  @Output() onDataChange = new EventEmitter<() => void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  protected filteredTransactions = [];
  protected loading = false;
  protected transactionsBeingUpdated: Set<string> = new Set();
  protected selectedTransactions: Transaction[] = [];

  constructor(private api: DefaultService, private alertService: UIAlertsService, private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.transactions && !changes.transactions.firstChange) {
      this.filterTransactions();
    }
  }

  protected filterTransactions() {
    this.filteredTransactions = this.transactions.filter((transaction) => {
      return true;
    });
  }

  protected visibilityChanged() {
    this.visibleChange.emit(this.visible);
  }

  public ngOnInit() {}

  protected onSelectionChange() {}

  protected createTransfer() {
    // Assume source transaction has a negative amount (money in)
    const sourceTransaction = this.sourceTransaction;
    // Assume target transaction has a positive amount (money out)
    const targetTransaction = this.selectedTransactions[0];
    this.loading = true;
    console.log('Creating transfer between', sourceTransaction, targetTransaction);

    const body: TransactionCategorizationRequest = {
      transaction_id: sourceTransaction.transaction_id,
      ledger_id: sourceTransaction.ledger_id,
      paired_transaction_id: targetTransaction.transaction_id,
      category_id: parseInt(sourceTransaction.transaction_category_id),
    };

    this.api.categorizeTransactionOnLedger(body).subscribe({
      next: (response) => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Transfer created successfully' });
        this.visible = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error creating transfer' });
        console.error('Error creating transfer');
        console.error(body);
        console.error(error);
      },
    });
  }
}
