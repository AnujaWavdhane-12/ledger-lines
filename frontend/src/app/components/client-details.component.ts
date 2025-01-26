import { Component, Output, EventEmitter, Input, OnInit, SimpleChanges } from '@angular/core';
import { BankAccountMapping, BankAccountMappingResult, Client, DefaultService } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { MessageService, SelectItem } from 'primeng/api';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'client-details-component',
  styles: [
    `
      :host ::ng-deep .p-tabview-panels {
        padding: 10px 0;
      }
    `,
    `
      :host ::ng-deep .p-dialog-header {
        padding-bottom: 0;
      }
    `,
  ],
  template: `
    <p-dialog
      header="Header"
      [(visible)]="visible"
      (onHide)="visibilityChanged()"
      (onShow)="visibilityChanged()"
      [blockScroll]="true"
      [modal]="true"
      [style]="{ width: '70vw', height: '70vw' }">
      <ng-template pTemplate="header">
        <h5>{{ client.first_name }} {{ client.last_name }}</h5>
      </ng-template>

      <p-tabView>
        <p-tabPanel header="Client details">
          <p-card>
            <client-details-form-component [loading]="loading" [(client)]="client"></client-details-form-component>
            <ng-template pTemplate="footer">
              <p-button (click)="visible = false" label="Cancel" styleClass="p-button-secondary p-button-text"></p-button>
              <p-button
                icon="pi pi-check"
                [loading]="loading"
                (click)="updateClient()"
                label="Update"
                styleClass="p-button-text"
                [style]="{ 'margin-left': '.5em' }"></p-button>
            </ng-template>
          </p-card>
        </p-tabPanel>
        <p-tabPanel header="Chart of Accounts" *ngIf="isClientLedgerConnected()">
          <p-card>
            <p-button
              label="Refresh Chart of Accounts"
              [loading]="isRefreshingChartOfAccounts"
              (click)="refreshChartOfAccounts($event)"
              icon="pi pi-refresh"
              styleClass="p-button-info" />
          </p-card>
        </p-tabPanel>
        <p-tabPanel header="Access">
          <p>Grant access to others.</p>
        </p-tabPanel>
      </p-tabView>

      <ng-template pTemplate="footer"></ng-template>
    </p-dialog>
  `,
})
export class ClientDetailsComponent implements OnInit {
  @Input() client: Client = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  protected mappingExtendedInfo: BankAccountMappingResult;
  protected chartOfAccountsDropdownOptions: SelectItem[] = [];
  protected loading = false;
  protected showMappingsTable = false;
  protected showMappingsError = false;
  protected mappingsErrorMessage = [];

  protected isRefreshingChartOfAccounts = false;
  protected automaticCategorizationSelectedValue = -1;

  protected validForm(): boolean {
    return this.client.first_name.length > 0 && this.client.preferred_communication.length > 0 && this.client.email.length > 0;
  }

  protected isClientLedgerConnected(): boolean {
    return this.client?.organization?.is_quickbooks_connected;
  }

  constructor(
    private api: DefaultService,
    private alertService: UIAlertsService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService
  ) {}

  public ngOnInit() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && !changes['client'].firstChange) {
      if (this.client) {
        if (this.client.transaction_suggestion_confidence_threshold) {
          // Assume no one will set values different than the ones in the dropdown
          this.automaticCategorizationSelectedValue = this.client.transaction_suggestion_confidence_threshold;
        } else {
          this.automaticCategorizationSelectedValue = -1;
        }
      }
    }
  }

  private showErrorMessages() {
    if (this.client) {
      const is_quickbooks_connected = this.client?.organization?.is_quickbooks_connected;
      const is_bank_connected = this.client?.organization?.is_bank_connected;

      if (is_quickbooks_connected && is_bank_connected) {
        this.showMappingsTable = true;
        this.showMappingsError = false;
        this.mappingsErrorMessage = [];
      } else if (is_quickbooks_connected || is_bank_connected) {
        if (!is_quickbooks_connected) {
          this.showMappingsTable = true;
          this.showMappingsError = true;
          this.mappingsErrorMessage = [
            { severity: 'error', summary: 'Connect a ledger', detail: "Before you can map banks to accounts, you'll need to connect a ledger." },
          ];
        } else if (!is_bank_connected) {
          this.showMappingsTable = false;
          this.showMappingsError = true;
          this.mappingsErrorMessage = [{ severity: 'error', summary: 'Connect a bank account', detail: 'Connect a bank account.' }];
        }
      } else {
        this.showMappingsTable = false;
        this.showMappingsError = true;
        this.mappingsErrorMessage = [
          {
            severity: 'error',
            summary: 'Connect a ledger and a bank account',
            detail: "Before you can map banks to accounts, you'll need to connect a ledger and a bank account.",
          },
        ];
      }

      if (is_quickbooks_connected) {
        this.chartOfAccountsDropdownOptions = this.mappingExtendedInfo.ledger_bank_accounts.map((account) => {
          return { label: account.name, value: account.category_id };
        });
      }
    }
  }

  protected visibilityChanged() {
    this.visibleChange.emit(this.visible);
    this.showMappingsTable = false;
    this.showMappingsError = false;
  }

  protected updateClient() {
    this.loading = true;

    if (this.automaticCategorizationSelectedValue !== -1) {
      this.client.transaction_suggestion_confidence_threshold = this.automaticCategorizationSelectedValue;
    } else {
      this.client.transaction_suggestion_confidence_threshold = null;
    }

    this.api.editClient(this.client, this.client.client_id).subscribe({
      next: (response) => {
        this.visible = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Client ${this.client.first_name} updated` });
      },
      error: (error) => {
        this.alertService.error('Error', 'There was an error updating the client');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  //
  // Mappings
  //
  protected mappingUsedInTable: BankAccountMapping[] = [];
  protected originalMappingsUsedInTable: BankAccountMapping[];

  private buildMappingsTable(mappingResults: BankAccountMappingResult) {
    // build a mappings to be used in the table, note that
    this.mappingUsedInTable = mappingResults.bank_accounts.map((bankAccount) => {
      // Find the mapping for this bank account
      const mapping = mappingResults.mappings.find((mapping) => mapping.plaid_account_id === bankAccount.plaid_account_id);

      return { plaid_account_id: bankAccount.plaid_account_id, ledger_account_id: mapping ? mapping.ledger_account_id : null };
    });

    this.originalMappingsUsedInTable = [];
  }

  onRowEditInit(mapping: BankAccountMapping) {
    // Save the original in case we undo the edit
    this.originalMappingsUsedInTable[mapping.plaid_account_id] = { ...mapping };
  }

  onRowEditSave(mapping: BankAccountMapping) {
    // Get rid of the backup
    delete this.originalMappingsUsedInTable[mapping.plaid_account_id];
  }

  onRowEditCancel(mapping: BankAccountMapping, index: number) {
    console.log('onRowEditSave', mapping, index);
    delete this.originalMappingsUsedInTable[mapping.plaid_account_id];
  }

  protected updateMappings() {
    this.api.saveMappings(this.mappingUsedInTable, this.client.client_id).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Mappings updated' });
      },
      error: (error) => {
        this.alertService.error({ severity: 'error', summary: 'Unable to update mappings', detail: 'There was an error updating the mappings' });
      },
    });
  }

  /**
   * Turn the plaid account ID into a human readable name
   *
   * @param plaid_account_id The string ID
   * @returns A human readable name for the account
   */
  protected plaidAccountIdToName(plaid_account_id: string) {
    if (!this.mappingExtendedInfo) {
      return '-';
    }
    const account = this.mappingExtendedInfo.bank_accounts.find((account) => account.plaid_account_id === plaid_account_id);
    return account ? account.name : '';
  }

  /**
   * Turn a chart of accounts category ID into a human readable label
   *
   * @param category_id An id of a category, also known as an account in the chart of accounts.
   * @returns A human readable label for the category
   */
  protected categoryIdToLabel(category_id: number) {
    const chartOfAccounts = this.mappingExtendedInfo.ledger_bank_accounts.find((account) => account.category_id === category_id);
    return chartOfAccounts ? chartOfAccounts.name : '-';
  }

  protected refreshChartOfAccounts(evt: Event) {
    // Avoid double clicking
    evt.preventDefault();

    const partnerId = this.localStorageService.getItem('partner_id');
    if (!partnerId) {
      this.alertService.error('No partner ID found', 'Error');
      return;
    }

    this.isRefreshingChartOfAccounts = true;

    // We determine ledger_id on backend
    const LEDGER_ID_NOT_USED = 0xbadf00d;
    this.api.refreshChartOfAccounts(partnerId, this.client.organization.organization_id, LEDGER_ID_NOT_USED).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Chart of Accounts refresh request suceeded',
          detail: 'It may take up to five minutes to see the updated chart of accounts.',
        });
      },
      error: (error) => {
        this.alertService.error('There was an error refreshing the chart of accounts', 'Error');
        console.error('Error refreshing chart of accounts');
        console.error(error);
      },
      complete: () => {
        this.isRefreshingChartOfAccounts = false;
      },
    });
  }
}
