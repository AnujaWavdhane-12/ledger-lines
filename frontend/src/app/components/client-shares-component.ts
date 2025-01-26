import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { Client, DefaultService, ShareClientParams } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'client-shares-component',
  template: `
    <p-dialog header="Header" [(visible)]="visible" (onHide)="visibilityChanged()" (onShow)="visibilityChanged()" [modal]="true" [style]="{ width: '35vw' }">
      <ng-template pTemplate="header">
        <h2>Share Clients</h2>
      </ng-template>

      <client-shares-form-component
        [loading]="loading"
        [(clients)]="clients"
        (clientsSelected)="shareClientsSelected = $event"
        (targetPartnerSelectedChange)="targetPartnerSelected = $event"></client-shares-form-component>

      <ng-template pTemplate="footer">
        <p-button (click)="visible = false" label="Cancel" styleClass="p-button-secondary p-button-text"></p-button>
        <p-button icon="pi pi-check" [disabled]="!validForm()" (click)="shareClients()" label="Share" styleClass="p-button-text"></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class ClientSharesComponent implements OnInit {
  @Input() clients: Client[] = [];
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  protected targetPartnerSelected: any[] = [];
  protected shareClientsSelected: any[] = [];
  protected loading = false;
  protected shareClientRequest: ShareClientParams;

  protected validForm(): boolean {
    return this.shareClientsSelected.length > 0 && this.targetPartnerSelected.length > 0;
  }

  constructor(private api: DefaultService, private alertService: UIAlertsService, private messageService: MessageService) {
    this.shareClientRequest = new Object() as ShareClientParams;
  }

  public ngOnInit() {}

  protected visibilityChanged() {
    this.visibleChange.emit(this.visible);
  }

  protected shareClients() {
    this.shareClientRequest.sharedClientIds = this.shareClientsSelected.map((client) => client.client_uid);
    this.loading = true;

    this.api.getPartnersFromEmails(this.targetPartnerSelected).subscribe({
      next: (partners) => {
        this.shareClientRequest.targetPartnerIds = partners.map((partner) => partner.partner_id);
        if (this.shareClientRequest.targetPartnerIds.length == 0) {
          this.loading = false;
          this.alertService.error('Error', 'There was no such partner matching any of the emails');
          return;
        }
        this.api.shareClientsforPartners(this.shareClientRequest).subscribe({
          next: () => {
            this.loading = false;
            this.visible = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client Shared' });
          },
          error: (error) => {
            this.loading = false;
            this.alertService.error('Error', 'There was an error sharing the client');
          },
        });
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error('Error', 'Failed to get partner information');
      },
    });
  }
}
