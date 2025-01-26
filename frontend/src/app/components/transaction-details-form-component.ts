import { Component, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { Transaction, DefaultService, LedgerAccount } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import moment from 'moment/moment';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'transaction-details-form-component',
  styles: [
    `
      :host ::ng-deep .p-panel-content {
        border: 0;
        padding: 0;
      }

      .row {
        padding: 5px;
      }

      :host ::ng-deep .p-dropdown.p-component {
        width: 100%;
      }

      label {
        padding: 10px 0;
      }
    `,
  ],
  template: `
    <p-blockUI [target]="pnl" [blocked]="loading">
      <i class="pi pi-lock" style="font-size: 3rem"></i>
    </p-blockUI>

    <p-panel #pnl [showHeader]="false">
      <div class="container">
        <div class="row">
          <div class="col-3">
            <label htmlfor="transactionMerchantName">Merchant Name</label>
          </div>
          <div class="col-9 ">
            <input pInputText id="transactionMerchantName" [(ngModel)]="transaction.merchant_name" />
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="transactionDate">Transaction Date</label>
          </div>
          <div class="col-9 ">
            <p-calendar
              (onSelect)="dropdownSelectionChanged()"
              (onBlur)="dropdownSelectionChanged()"
              [(ngModel)]="transactionDateSelected"
              dateFormat="mm/dd/yy"
              [appendTo]="'body'"></p-calendar>
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="transactionAmount">Amount</label>
          </div>
          <div class="col-9 ">
            <p-inputNumber
              id="transactionAmount"
              [(ngModel)]="transaction.amount"
              mode="currency"
              currency="USD"
              locale="en-US"
              placeholder="USD"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"></p-inputNumber>
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="transactionCategory">Category</label>
          </div>
          <div class="col-9 ">
            <p-dropdown
              (onChange)="dropdownSelectionChanged()"
              [options]="chartOfAccountsDropdownOptions"
              optionLabel="label"
              optionValue="value"
              [autoDisplayFirst]="false"
              [(ngModel)]="transactionCategorySelected"
              appendTo="body"
              [style]="{ width: '100%' }"></p-dropdown>
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="transactionDescription">Description</label>
          </div>
          <div class="col-9 ">
            <input pInputText id="transactionDescription" [(ngModel)]="transaction.original_description" />
          </div>
        </div>
      </div>
    </p-panel>
  `,
})
export class TransactionDetailsFormComponent implements OnInit, OnChanges {
  @Input() transaction: Transaction;
  @Input() chartOfAccounts: LedgerAccount[];
  protected transactionDateSelected: string;
  protected transactionCategorySelected: string;
  protected chartOfAccountsDropdownOptions: SelectItem[] = [];

  public ngOnInit() {
    if (!this.transaction) {
      this.transaction = new Object() as Transaction;
    }
    this.chartOfAccountsDropdownOptions = [];
  }

  @Input() loading = false;

  constructor(private api: DefaultService, private alertService: UIAlertsService) {}

  /**
   * Triggered when the component inputs change
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.transaction?.firstChange && changes?.transaction?.currentValue) {
      const transaction = changes?.transaction?.currentValue;

      if (transaction) {
        this.transactionDateSelected = moment(transaction.date).format('L');
      }
    }

    if (changes.chartOfAccounts) {
      this.chartOfAccountsDropdownOptions = this.chartOfAccounts?.map((account) => {
        return { label: account.name, value: account.category_id };
      });
    }
  }

  protected categoryIdToLabel(category_id: number) {
    if (!this.chartOfAccounts) {
      return '';
    }
    const category = this.chartOfAccounts.find((account) => account.category_id === category_id);
    return category ? category.name : '';
  }

  public dropdownSelectionChanged() {
    this.transaction.date = this.transactionDateSelected;
    this.transaction.transaction_category_id = this.transactionCategorySelected;
  }
}
