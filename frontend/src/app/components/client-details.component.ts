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
      :host ::ng-deep .p-dialog-header {
        padding-bottom: 0;
      }
    `,
  ],
  template: `
    <p-dialog
      header="Client Details"
      [(visible)]="visible"
      (onHide)="handleVisibilityChange()"
      [blockScroll]="true"
      [modal]="true"
      [style]="{ width: '70vw', height: '70vw' }">
      <ng-template pTemplate="header">
        <h5>{{ client?.first_name }} {{ client?.last_name }}</h5>
      </ng-template>

      <p-tabView>
        <p-tabPanel header="Client Details">
          <p-card>
            <client-details-form-component [loading]="loading" [(client)]="client"></client-details-form-component>
            <ng-template pTemplate="footer">
              <p-button label="Cancel" styleClass="p-button-secondary p-button-text" (click)="closeDialog()"></p-button>
              <p-button
                label="Update"
                icon="pi pi-check"
                styleClass="p-button-text"
                [loading]="loading"
                (click)="updateClient()"></p-button>
            </ng-template>
          </p-card>
        </p-tabPanel>

        <p-tabPanel *ngIf="isClientLedgerConnected()" header="Chart of Accounts">
          <p-card>
            <p-button
              label="Refresh Chart of Accounts"
              icon="pi pi-refresh"
              styleClass="p-button-info"
              [loading]="isRefreshingChartOfAccounts"
              (click)="refreshChartOfAccounts($event)">
            </p-button>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Access">
          <p>Grant access to others.</p>
        </p-tabPanel>
      </p-tabView>
    </p-dialog>
  `,
})
export class ClientDetailsComponent implements OnInit {
  @Input() client: Client = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  loading = false;
  isRefreshingChartOfAccounts = false;
  automaticCategorizationSelectedValue = -1;

  mappingExtendedInfo: BankAccountMappingResult;
  chartOfAccountsDropdownOptions: SelectItem[] = [];
  showMappingsTable = false;
  showMappingsError = false;
  mappingsErrorMessage = [];

  constructor(
    private api: DefaultService,
    private alertService: UIAlertsService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.client) {
      this.automaticCategorizationSelectedValue = this.client.transaction_suggestion_confidence_threshold ?? -1;
    }
  }

  closeDialog(): void {
    this.visible = false;
    this.handleVisibilityChange();
  }

  handleVisibilityChange(): void {
    this.visibleChange.emit(this.visible);
    this.showMappingsTable = false;
    this.showMappingsError = false;
  }

  updateClient(): void {
    if (!this.validForm()) {
      this.alertService.error('Validation Error', 'Please fill in all required fields.');
      return;
    }

    this.loading = true;
    this.client.transaction_suggestion_confidence_threshold =
      this.automaticCategorizationSelectedValue !== -1 ? this.automaticCategorizationSelectedValue : null;

    this.api.editClient(this.client, this.client.client_id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Client ${this.client.first_name} updated successfully` });
        this.closeDialog();
      },
      error: () => {
        this.alertService.error('Error', 'Failed to update client details.');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  isClientLedgerConnected(): boolean {
    return !!this.client?.organization?.is_quickbooks_connected;
  }

  refreshChartOfAccounts(event: Event): void {
    event.preventDefault();

    const partnerId = this.localStorageService.getItem('partner_id');
    if (!partnerId) {
      this.alertService.error('Error', 'No partner ID found.');
      return;
    }

    this.isRefreshingChartOfAccounts = true;

    this.api.refreshChartOfAccounts(partnerId, this.client.organization.organization_id, 0xbadf00d).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Chart of Accounts refreshed successfully. Updates may take up to five minutes to appear.',
        });
      },
      error: (error) => {
        this.alertService.error('Error', 'Failed to refresh Chart of Accounts.');
        console.error('Error refreshing chart of accounts:', error);
      },
      complete: () => {
        this.isRefreshingChartOfAccounts = false;
      },
    });
  }

  private validForm(): boolean {
    return (
      !!this.client?.first_name &&
      !!this.client?.preferred_communication &&
      !!this.client?.email
    );
  }
}
