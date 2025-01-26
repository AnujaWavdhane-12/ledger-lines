import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { MessageService } from 'primeng/api';
import { Client, DefaultService, RedirectionUrl } from 'src/service-sdk';

@Component({
  selector: 'app-crm-client-list-component',
  providers: [MessageService],
  styles: [
    `
      .top-menu {
        padding: 0;
      }

      .right-align {
        text-align: end;
      }
    `,
  ],
  template: `
    <p-toast></p-toast>
    <dashboard-page-component [title]="'clients'">
      <div class="row">
        <div class="col-10">
          <h3>Clients</h3>
        </div>
        <div class="col-2 d-flex gap-2 justify-content-end">
          <p-button (click)="toggleShareClientModal(this.clients)" icon="pi pi-share-alt" label="Share"></p-button>
          <p-button (click)="toggleNewClientModal()" icon="pi pi-plus" label="New"></p-button>
        </div>
      </div>

      <bank-connection-request-component [(visible)]="showBankConnectionRequestModal" [(client)]="selectedClient"></bank-connection-request-component>

      <client-shares-component [(visible)]="showShareClientModal" [(clients)]="clients"></client-shares-component>

      <!-- MODAL TO CREATE A NEW CLIENT -->
      <client-create-component (onDataChange)="refreshTable()" [(visible)]="showNewClientModal"></client-create-component>

      <!-- MODAL TO SHOW AND EDIT A CLIENT DETAILS -->
      <client-details-component [(visible)]="showClientDetailsModal" [(client)]="selectedClient"></client-details-component>

      <clients-table-component
        [loading]="isLoading"
        (showBankConnectionRequestModal)="showBankConnectionRequestModalFn($event)"
        [value]="clients"
        (ledgerAction)="handleLedgerClick($event)"></clients-table-component>

    </dashboard-page-component>
  `,
})
export class CrmClientListComponent implements OnInit {
  public clients: any[];
  protected isLoading = false;
  protected showBankConnectionRequestModal = false;
  protected showNewClientModal = false;
  protected showClientDetailsModal = false;
  protected selectedClient = null;
  protected showShareClientModal = false;

  public constructor(
    @Inject(DOCUMENT)
    public doocument: Document,
    private api: DefaultService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private messageService: MessageService
  ) {
    this.clients = [];
    titleService.setTitle('Clients | LedgerLines');
  }

  public ngOnInit() {
    this.loadClients();
  }

  protected showClientDetailsModalFn(event: any) {
    this.selectedClient = event as Client;
    this.showClientDetailsModal = true;
  }

  protected showBankConnectionRequestModalFn(event: any) {
    this.selectedClient = event as Client;
    this.showBankConnectionRequestModal = true;
  }

  protected toggleNewClientModal() {
    this.showNewClientModal = !this.showNewClientModal;
  }

  protected toggleShareClientModal(clients: Client[]) {
    this.clients = clients;
    this.showShareClientModal = !this.showShareClientModal;
  }

  protected refreshTable() {
    this.loadClients();
  }

  protected handleLedgerClick(event) {
    const { rowData, ledgerId } = event;
    console.log('handleLedgerClick', rowData, ledgerId);
    this.api.getLedgerConnectionUrl(0, rowData.organization.organization_id, ledgerId).subscribe({
      next: (value: RedirectionUrl) => {
        window.open(value.url, '_blank');
      },
      error: (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error while creating ledger connection. Please try again later' });
      },
    });
  }

  private loadClients() {
    this.isLoading = true;

    this.api.getClients(0, 100).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Sort by client id
        this.clients = response.sort((a, b) => b.client_id - a.client_id);
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
      },
    });
  }
}
