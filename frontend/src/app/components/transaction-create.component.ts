import { Component, Output, EventEmitter, Input, OnInit, NgModule, SimpleChanges } from '@angular/core';
import { Client, DefaultService, LedgerAccount, Organization, Transaction } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'transaction-create-component',
  styles: [],
  template: `
    <p-dialog header="Header" [(visible)]="visible" (onHide)="visibilityChanged()" (onShow)="visibilityChanged()" [modal]="true" [style]="{ width: '50vw' }">
      <ng-template pTemplate="header">
        <h5>Add a transaction</h5>
      </ng-template>

      <transaction-details-form-component
        [loading]="loading"
        [transaction]="createTransactionRequest"
        [chartOfAccounts]="chartOfAccounts"></transaction-details-form-component>

      <ng-template pTemplate="footer">
        <p-button icon="pi pi-check" [loading]="loading" (click)="addTransaction()" label="Ok" styleClass="p-button-text"></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class TransactionCreateComponent implements OnInit {
  @Output() onDataChange = new EventEmitter<() => void>();
  @Input() client: Client;
  @Input() visible = false;
  @Input() chartOfAccounts: LedgerAccount[];
  @Output() visibleChange = new EventEmitter<boolean>();

  protected createTransactionRequest: Transaction;
  protected loading = false;

  constructor(private api: DefaultService, private alertService: UIAlertsService, private messageService: MessageService) {
    this.createTransactionRequest = new Object() as Transaction;
  }

  protected visibilityChanged() {
    this.visibleChange.emit(this.visible);
  }

  public ngOnInit() {}

  protected addTransaction() {
    this.loading = true;
    this.api.createTransactionForOrganization(this.client.partner_uid, this.client.organization.organization_id, this.createTransactionRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.visible = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Transaction created' });
        this.onDataChange.emit();
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        this.alertService.error('Error', 'There was an error creating the transaction');
      },
    });
  }
}
