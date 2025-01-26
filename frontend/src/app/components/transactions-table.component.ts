import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MessageService, SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { DefaultService, LedgerAccount, Transaction } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { DateObjectPipe } from './date-object.pipe.component';
import { SupportedLedgers } from 'src/models/models';
import { Router } from '@angular/router';

class ChartOfAccountsDropdownOption implements SelectItem {
  label?: string;
  value: any;
  styleClass?: string;
  icon?: string;
  title?: string;
  disabled?: boolean;

  constructor(label: string, value: any, public type: string, public subtype: string, public isBankAccount: boolean) {
    this.label = label;
    this.value = value;
  }
}

@Component({
  selector: 'app-transactions-table-component',
  styles: [
    `
      :host ::ng-deep .p-dropdown li {
        padding: 0 20px;
      }

      .type_and_subtype {
        font-size: 0.8rem !important;
        color: gray !important;
      }

      :host ::ng-deep .transaction-details {
        height: 2rem !important;
      }
      .negative-amount {
        color: blue;
      }
      .amount {
        font-family: monospace;
        text-align: start !important;
      }

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
        padding: 0.25rem 0.5rem;
      }

      :host ::ng-deep .p-column-filter-menu-button.p-column-filter-menu-button-active {
        background-color: var(--primary-light-color);
      }

      :host ::ng-deep .p-datatable-thead {
        border-bottom-width: 0 !important;
      }

      :host ::ng-deep .p-paginator-bottom {
        border: none;
      }

      :host ::ng-deep .table-header {
        display: flex;
        justify-content: flex-end;
        align-items: right;
        padding: 0.5rem;
      }

      :host ::ng-deep .search-container {
        margin-left: auto;
      }

      .overflow-auto {
        scrollbar-width: none;
      }

      .overflow-auto::-webkit-scrollbar {
        display: none;
      }

      .ai-generated {
        background: linear-gradient(to right, #ef5350, #f48fb1, #7e57c2, #2196f3, #26c6da, #43a047, #ff5722);
        background-size: 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 5s ease-in-out infinite alternate;
      }
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        100% {
          background-position: 100% 50%;
        }
      }

      .inline-loader {
        width: 90px;
        height: 14px;
        color: #80808036;
        background: linear-gradient(90deg, #0000 16px, currentColor 0 30px, #0000 0), radial-gradient(circle closest-side at 68% 50%, currentColor 92%, #0000),
          conic-gradient(from 45deg at calc(100% - 7px) 50%, currentColor 90deg, #0000 0), conic-gradient(from -135deg at 7px 50%, currentColor 90deg, #0000 0);
        background-position: 0 0;
        background-size: calc(3 * 100% / 4) 100%;
        background-repeat: repeat-x;
        animation: l9 2s infinite linear;
      }
      @keyframes l9 {
        100% {
          background-position: -300% 0;
        }
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td.merchant-cell {
        position: relative;
        padding: 1rem 0.5rem;
        z-index: 1;
      }

      .merchant-content {
        position: relative;
        z-index: 2;
      }

      .merchant-background {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-repeat: no-repeat;
        background-size: contain;
        opacity: 0.1;
        z-index: 1;
      }
    `,
  ],
  template: `
    <div *ngIf="loading; else content" class="d-flex align-items-center justify-content-center">
      <p-progressSpinner></p-progressSpinner>
    </div>

    <ng-template #content>
      <p-table
        #dt
        [sortableColumns]="true"
        [scrollable]="false"
        [value]="transactions"
        [reorderableColumns]="true"
        [resizableColumns]="true"
        [paginator]="true"
        [rows]="50"
        editMode="row"
        dataKey="transaction_id"
        [rowsPerPageOptions]="[10, 25, 50, 100]"
        [showCurrentPageReport]="true"
        [sortField]="defaultSortField"
        [sortOrder]="defaultSortOrder"
        [(selection)]="selectedTransactions"
        (selectAllChange)="rowSelectionChange($event)"
        (onRowSelect)="rowSelectionChange($event)"
        (onRowUnselect)="rowSelectionChange($event)"
        (onHeaderCheckboxToggle)="rowSelectionChange($event)"
        selectionMode="multiple"
        styleClass="p-datatable-sm"
        columnResizeMode="expand"
        [globalFilterFields]="['date', 'merchant_name', 'original_description', 'transaction_category_id', 'amount', 'transaction_id']"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
        <!-- Global Filter -->
        <ng-template pTemplate="caption">
          <div class="table-header">
            <button pButton type="button" label="Clear Filters" class="p-button-outlined ml-2" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="p-input-icon-left search-container">
              <i class="pi pi-search"></i>
              <input pInputText type="text" (input)="dt.filterGlobal($event.target.value, 'contains')" placeholder="Search in all columns" />
            </span>
          </div>
        </ng-template>

        <!-- Header -->
        <ng-template pTemplate="header" let-columns>
          <tr>
            <th><p-tableHeaderCheckbox></p-tableHeaderCheckbox></th>
            <th pReorderableColumn pResizableColumn pSortableColumn="date">
              Date
              <p-sortIcon field="date"></p-sortIcon>
              <p-columnFilter type="date" field="date" display="menu" [showMatchModes]="true" [matchModes]="['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter']">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-calendar [ngModel]="value" (ngModelChange)="filter($event)" [showButtonBar]="true"></p-calendar>
                </ng-template>
              </p-columnFilter>
            </th>
            <th pReorderableColumn pResizableColumn pSortableColumn="account_friendly_name">
              Account
              <p-sortIcon field="account_friendly_name"></p-sortIcon>
              <p-columnFilter type="text" field="account_friendly_name" display="menu"></p-columnFilter>
            </th>
            <!--
            <th pReorderableColumn pResizableColumn pSortableColumn="merchant_name">
              Merchant
              <p-sortIcon field="merchant_name"></p-sortIcon>
              <p-columnFilter type="text" field="merchant_name" display="menu"></p-columnFilter>
            </th>
-->
            <th pReorderableColumn pResizableColumn pSortableColumn="original_description">
              Description
              <p-sortIcon field="original_description"></p-sortIcon>
              <p-columnFilter type="text" field="original_description" display="menu"></p-columnFilter>
            </th>
            <th pReorderableColumn pResizableColumn pSortableColumn="transaction_category_id">
              Category
              <p-sortIcon field="transaction_category_id"></p-sortIcon>
              <p-columnFilter type="text" field="transaction_category_id" display="menu"></p-columnFilter>
            </th>
            <th pReorderableColumn pResizableColumn pSortableColumn="amount">
              Amount
              <p-sortIcon field="amount"></p-sortIcon>
              <p-columnFilter type="numeric" field="amount" [maxFractionDigits]="2" display="menu"></p-columnFilter>
            </th>
            <!--
            <th pReorderableColumn pResizableColumn pSortableColumn="transaction_id">
              Id
              <p-sortIcon field="transaction_id"></p-sortIcon>
              <p-columnFilter type="text" field="transaction_id" display="menu"></p-columnFilter>
            </th>
-->
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-rowData let-rowIndex="rowIndex">
          <tr [pEditableRow]="rowData">
            <!-- Row selection checkbox -->
            <td>
              <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
            </td>

            <!-- Date -->
            <td>
              <span>{{ rowData.date }}</span>
            </td>

            <td>
              <span>{{ rowData.account_friendly_name }}</span>
            </td>

            <!-- Merchant logo and name -->
            <!--
            <td>
              <p-avatar image="{{ rowData.logo_url }}" styleClass="mr-2" shape="circle"></p-avatar>
              {{ rowData.merchant_name }}
            </td>
-->

            <!-- original_description -->
            <td class="merchant-cell" pTooltip="{{ rowData.original_description }}">
              <div class="merchant-background" [style.background-image]="'url(' + rowData.logo_url + ')'"></div>
              <div class="merchant-content">
                <strong>{{ rowData.merchant_name }}</strong>
                <br />
                {{ rowData.original_description }}
              </div>
            </td>

            <!-- -------------------------------- -->
            <!-- Transaction category dropdown    -->
            <!-- -------------------------------- -->
            <td style="align-items: center;">
              <ng-container *ngIf="transactionsBeingUpdated.has(rowData.transaction_id)">
                <div class="inline-loader"></div>
              </ng-container>

              <ng-container *ngIf="!transactionsBeingUpdated.has(rowData.transaction_id)">
                <p-dropdown
                  [pTooltip]="getAiSuggestionText(rowData?.ai_suggestion)"
                  [options]="chartOfAccountsDropdownOptions"
                  appendTo="body"
                  [(ngModel)]="rowData.transaction_category_id"
                  (onChange)="dropDownSelection(rowData.transaction_id, rowData.transaction_category_id)"
                  [filter]="true"
                  filterBy="label"
                  [style]="{ width: '80%' }">
                  <ng-template pTemplate="selectedItem">
                    <div [ngClass]="{ 'ai-generated': rowData.transaction_category_id == rowData.suggestion_transaction_category_id }">
                      {{ categoryIdToLabel(rowData.transaction_category_id) }}
                    </div>
                  </ng-template>
                  <ng-template let-account pTemplate="item">
                    <div [ngClass]="{ 'ai-generated': account.value == rowData.suggestion_transaction_category_id }">
                      <span>{{ categoryIdToLabel(account.value) }}</span>
                      <br />
                      <span class="type_and_subtype">{{ account.type }} > {{ account.subtype }}</span>
                    </div>
                  </ng-template>
                </p-dropdown>
                <p-menu #menu [popup]="true" [model]="menuItems" appendTo="body"></p-menu>
                <p-button
                  type="button"
                  icon="pi pi-ellipsis-v"
                  (onClick)="toggleMenu(rowData, rowIndex); menu.toggle($event)"
                  styleClass="p-button-rounded p-button-text"></p-button>
              </ng-container>
            </td>

            <td class="amount" [ngClass]="{ 'negative-amount': rowData.amount < 0 }">$ {{ rowData.amount.toFixed(2) }}</td>

            <!--
            <td>
              {{ rowData.transaction_id }}
            </td>
            -->
          </tr>
        </ng-template>
      </p-table>
    </ng-template>
  `,
})
export class TransactionsTableComponent implements OnInit, OnChanges {
  @Input() loading?: boolean;
  @Input() transactions: any[];
  @Input() chartOfAccounts: LedgerAccount[];
  @Input() transactionsBeingUpdated: Set<number>;
  @Input() updatedTransactions: Transaction[] = [];
  @Output() updatedTransactionsChange = new EventEmitter<Transaction[]>();
  @Output() aiCategorizationRequested = new EventEmitter<Transaction[]>();
  @Output() onSelectionChange = new EventEmitter<CallableFunction>();
  @Output() initiatedTransfer = new EventEmitter<{ transaction_id: any; category_id: number }>();

  @Input() selectedTransactions: any[];
  @Output() selectedTransactionsChange = new EventEmitter<Transaction[]>();

  protected chartOfAccountsDropdownOptions: ChartOfAccountsDropdownOption[] = [];
  protected defaultSortField?: string;
  protected transactionLedger?: string;
  protected defaultSortOrder?: number = 1;
  protected menuItems: any[];

  constructor(private router: Router, private api: DefaultService, private alertService: UIAlertsService, private messageService: MessageService) {}

  protected getAiSuggestionText(aiSuggestion: any) {
    if (aiSuggestion?.reasoning) {
      const confidence = Number.parseInt(aiSuggestion?.confidence_level) * 10;
      return `Confidence: ${confidence?.toFixed(0)}% - ${aiSuggestion?.reasoning}`;
    }
    return 'No AI suggestion available';
  }

  protected toggleMenu(rowData: any, rowIndex: number) {
    this.menuItems = [
      {
        label: 'AI Suggest',
        icon: 'pi pi-bolt',
        command: () => {
          this.requestAiSuggestion(rowData);
        },
      },
    ];

    if (rowData.qbo_realm_id && rowData.categorization_status == 'Validated') {
      this.menuItems.push({
        label: 'Open in ledger',
        icon: 'pi pi-external-link',
        command: () => {
          if (rowData.ledger_id == SupportedLedgers.Xero) {
            window.open(`https://go.xero.com/Bank/ViewTransaction.aspx?bankTransactionID=${rowData.ledger_transaction_id}`, '_blank');
          } else if (rowData.ledger_id == SupportedLedgers.QuickBooks) {
            window.open(`https://qbo.intuit.com/app/switchCompany?companyId=${rowData.qbo_realm_id}`, '_blank');
          } else {
            this.alertService.error('Error', 'Please connect to a ledger');
          }
        },
      });
    }
  }

  ngOnInit() {
    this.chartOfAccountsDropdownOptions = [];
  }

  ngOnChanges(changes: any) {
    if (changes.chartOfAccounts) {
      this.chartOfAccountsDropdownOptions = this.chartOfAccounts?.map((account) => {
        return new ChartOfAccountsDropdownOption(account.name, account.category_id, account.type, account.sub_type, account.is_transfer_compatible);
      });
    }
  }

  /**
   * When you make a new categorization, if you select a bank account this triggers a Transfer flow in the parent component.
   */
  protected dropDownSelection(transaction_id: any, category_id: number) {
    const isBankAccountSelected = this.chartOfAccountsDropdownOptions.some((account) => account.value === category_id && account.isBankAccount === true);
    if (isBankAccountSelected) {
      this.initiatedTransfer.emit({ transaction_id: transaction_id, category_id: category_id });
    }
  }

  protected rowSelectionChange(event: any) {
    this.selectedTransactionsChange.emit(this.selectedTransactions);
    this.onSelectionChange.emit();
  }

  protected categoryIdToLabel(category_id: number) {
    if (!this.chartOfAccounts) {
      return '-';
    }
    const category = this.chartOfAccounts.find((account) => account.category_id === category_id);
    return category ? category.name : '';
  }

  protected requestAiSuggestion(transaction: any) {
    this.aiCategorizationRequested.emit([transaction]);
  }

  // Clear the table filters and search effects
  protected clear(table: Table) {
    table.clear();
    const searchInput = document.querySelector('.search-container input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }
}
