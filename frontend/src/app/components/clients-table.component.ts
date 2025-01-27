import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Table } from 'primeng/table';
import { Client } from 'src/service-sdk';

@Component({
  selector: 'clients-table-component',
  styles: [
    `
      :host ::ng-deep .p-badge {
        align-items: center;
        display: flex;
        justify-content: center;
        margin: 0 auto;
        width: fit-content;
      }

      :host ::ng-deep .p-badge,
      .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :host ::ng-deep .p-button {
        padding: 2px 10px;
        white-space: nowrap;
      }

      :host ::ng-deep .p-component {
        font-family: var(--body-font);
      }

      :host ::ng-deep .p-datatable > div {
        border: 1px solid var(--surface-d);
        border-radius: var(--border-radius);
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
        transition: background-color 0.25s;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
        background-color: var(--surface-d);
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:last-child td {
        border-bottom: none;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td,
      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        max-width: 300px;
        padding: 0.5rem;
      }

      :host ::ng-deep .p-datatable-thead > tr > th {
        max-width: 100px;

        div {
          display: flex;
          align-items: center;
          white-space: normal;
        }
      }

      :host ::ng-deep .p-datatable-thead {
        flex-direction: row;
        border-bottom-width: 0 !important;
      }

      :host ::ng-deep .p-paginator-bottom {
        border: none;
      }

      .overflow-auto {
        scrollbar-width: none;
      }

      .overflow-auto::-webkit-scrollbar {
        display: none;
      }

      td span.centered-cell {
        display: flex;
        justify-content: center;
      }
    `,
  ],
  template: `
    <div *ngIf="loading; else content" class="d-flex align-items-center justify-content-center">
      <p-progressSpinner></p-progressSpinner>
    </div>

    <ng-template #content>
      <p-table
        #dataTable
        [scrollable]="true"
        [value]="value"
        [reorderableColumns]="true"
        [resizableColumns]="true"
        [paginator]="true"
        [rows]="50"
        [rowsPerPageOptions]="[10, 25, 50, 100]"
        [showCurrentPageReport]="true"
        [globalFilterFields]="['first_name', 'last_name', 'email', 'organization.name']"
        [sortField]="defaultSortField"
        [sortOrder]="defaultSortOrder"
        selectionMode="multiple"
        styleClass="p-datatable-sm"
        columnResizeMode="expand"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
        <ng-template pTemplate="caption">
          <div class="flex">
            <div class="p-inputgroup">
              <input
                pInputText
                type="text"
                (input)="dataTable.filterGlobal($event.target.value, 'contains')"
                placeholder="Search clients" />
              <button
                pButton
                label="Clear"
                class="p-button-outlined"
                icon="pi pi-filter-slash"
                (click)="clear(dataTable)"></button>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th *ngIf="showCheckbox">
              <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
            </th>
            <th pReorderableColumn pResizableColumn [pSortableColumn]="'first_name'">
              Client
              <p-sortIcon [field]="'first_name'"></p-sortIcon>
            </th>
            <th pReorderableColumn pResizableColumn>Ledger Connection</th>
            <th pReorderableColumn pResizableColumn>Bank Connection</th>
            <th pReorderableColumn pResizableColumn>Edit</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-rowData>
          <tr>
            <td *ngIf="showCheckbox">
              <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
            </td>

            <td>
              <a [routerLink]="['/clients', rowData.client_id, 'transactions']" class="text-decoration-underline">
                <span>{{ rowData.first_name + ' ' + rowData.last_name || '-' }}</span>
                <br />
                <small>{{ rowData.email }}</small>
              </a>
            </td>

            <td>
              <ng-container *ngIf="rowData.organization?.is_quickbooks_connected; else showSplitButton">
                <div style="display: flex; justify-content: center; color: green;">
                  <i class="pi pi-check"></i>
                </div>
              </ng-container>

              <ng-template #showSplitButton>
                <span class="p-buttonset">
                  <button (click)="ledgerAction.emit({ rowData, ledgerId: 1 })" pButton pRipple label="QB"></button>
                  <button (click)="ledgerAction.emit({ rowData, ledgerId: 2 })" pButton pRipple label="Xero"></button>
                </span>
              </ng-template>
            </td>

            <td>
              <ng-container *ngIf="rowData.organization?.is_bank_connected; else bankNotConnected">
                <div style="display: flex; justify-content: center; color: green;">
                  <i class="pi pi-check"></i>
                </div>
              </ng-container>

              <ng-template #bankNotConnected>
                <p-button
                  icon="pi pi-external-link"
                  label=""
                  [loading]="false"
                  styleClass="p-button-outlined"
                  (click)="showBankConnectionForm(rowData)"></p-button>
              </ng-template>
            </td>

            <td>
              <p-button
                icon="pi pi-cog"
                label="Edit"
                styleClass="p-button-outlined"
                (click)="editClient(rowData)">
              </p-button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </ng-template>
  `,
})
export class ClientsTableComponent {
  @Output() showBankConnectionRequestModal = new EventEmitter<Client>();
  @Output() ledgerAction = new EventEmitter<{ rowData: Client; ledgerId: number }>();
  @Output() selectedClientEvent = new EventEmitter<Client>();

  @Input() loading = false;
  @Input() value: Client[] = [];
  @Input() defaultSortField = 'first_name';
  @Input() defaultSortOrder = 1;
  @Input() showCheckbox = false;

  showBankConnectionForm(rowData: Client): void {
    this.showBankConnectionRequestModal.emit(rowData);
  }

  clear(table: Table): void {
    table.clear();
  }

  editClient(client: Client): void {
    this.selectedClientEvent.emit(client);
  }
}
