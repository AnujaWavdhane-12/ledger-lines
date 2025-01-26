import { Component, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { Client, DefaultService, Organization } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import moment from 'moment';

@Component({
  selector: 'client-details-form-component',
  styles: [
    `
      :host ::ng-deep .p-panel-content {
        border: 0;
        padding: 0;
      }

      .row {
        padding: 5px;
        align-items: center;
      }

      label {
        padding: 12px 0;
        font-weight: 600;
      }

      .p-inputtext {
        width: 100%;
      }

      :host ::ng-deep .p-dropdown.p-component {
        width: 100%;
      }
    `,
  ],
  template: `
    <p-blockUI [target]="pnl" [blocked]="loading">
      <i class="pi pi-lock" style="font-size: 3rem"></i>
    </p-blockUI>

    <p-panel #pnl [showHeader]="false">
      <div class="container">
        <!--
        <div class="row">
          <div class="col-3">
            <label htmlfor="organizationName">Organization name</label>
          </div>
          <div class="col-9 ">
            <input pInputText id="organizationName" [(ngModel)]="client.organization.name" />
          </div>
        </div>
-->

<!--
        <div class="row">
          <div class="col-3">
            <label htmlfor="organizationIndustry">Industry</label>
          </div>
          <div class="col-9 ">
            <input pInputText id="organizationIndustry" [(ngModel)]="client.organization.industry" />
          </div>
        </div>
-->

        <div class="row">
          <div class="col-3">
            <label htmlfor="contactFirstName">Contact first name</label>
          </div>
          <div class="col-9 ">
            <input pInputText id="contactFirstName" #first_name="ngModel" [(ngModel)]="client.first_name" required />
            <small class="p-error" *ngIf="first_name.invalid && first_name.touched">Please enter your first name</small>
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="contactLastName">Contact last name</label>
          </div>
          <div class="col-9 ">
            <input pInputText id="contactLastName" [(ngModel)]="client.last_name" />
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="contactPrefferredMethodOfCommunication">Preferred Contact method</label>
          </div>
          <div class="col-9 ">
            <p-dropdown
              (onChange)="dropdownSelectionChanged()"
              [options]="communicationMethods"
              [autoDisplayFirst]="false"
              [(ngModel)]="communicationMethodsSelected"
              optionLabel="name"></p-dropdown>

            <input
              *ngIf="communicationMethodsSelected?.name === 'Other'"
              pInputText
              [(ngModel)]="client.preferred_communication"
              placeholder="Specify method required"
              class="flex-grow-1, mt-2"
              required />
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="contactPhone">Phone number</label>
          </div>
          <div class="col-9 ">
            <input pInputText id="contactPhone" [(ngModel)]="client.phone" #phone="ngModel" required />
            <div *ngIf="phone.invalid && (phone.dirty || phone.touched)" class="text-danger">
              <small *ngIf="phone.errors?.['required']">Phone number is required.</small>
              <small *ngIf="phone.errors?.['pattern']">Phone number required-format: 123-456-7890</small>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="contactEmail">Email</label>
          </div>
          <div class="col-9 ">
            <input
              pInputText
              id="contactEmail"
              [(ngModel)]="client.email"
              #email="ngModel"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
              required />
            <small class="p-error" *ngIf="email.invalid && email.touched">Please enter a valid email address</small>
          </div>
        </div>

        <div class="row">
          <div class="col-3">
            <label htmlfor="accountingStartDate">Accounting Start Date</label>
          </div>
          <div class="col-9 ">
            <p-calendar
              (onSelect)="dropdownSelectionChanged()"
              (onBlur)="dropdownSelectionChanged()"
              [(ngModel)]="accountingStartDateSelected"
              dateFormat="MM/dd/yy"></p-calendar>
          </div>
        </div>
      </div>
    </p-panel>
  `,
})
export class ClientDetailsFormComponent implements OnInit, OnChanges {
  @Input() client: Client;
  protected communicationMethods: any[] = [];
  protected communicationMethodsSelected: { name: string };
  protected accountingStartDateSelected: Date;

  public ngOnInit() {
    this.communicationMethods = [
      { name: 'WhatsApp', code: 'NY' },
      { name: 'Email', code: 'RM' },
      { name: 'SMS', code: 'LDN' },
      { name: 'Other', code: 'IST' },
    ];

    if (!this.client) {
      this.client = new Object() as Client;
      this.client.organization = new Object() as Organization;
      this.client.preferred_communication = this.communicationMethods[0].name;
    }
  }

  @Input() loading = false;

  constructor(private api: DefaultService, private alertService: UIAlertsService) {}

  /**
   * Triggered when the component inputs change
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.client?.firstChange && changes?.client?.currentValue) {
      const client = changes?.client?.currentValue;

      if (client) {
        this.accountingStartDateSelected = moment(client.accounting_start_date).toDate();
        this.communicationMethodsSelected = this.communicationMethods.find((method) => method.name === client.preferred_communication);
      }
    }
  }

  public dropdownSelectionChanged() {
    this.client.preferred_communication = this.communicationMethodsSelected.name === 'Other' ? '' : this.communicationMethodsSelected.name;
    this.client.accounting_start_date = moment(this.accountingStartDateSelected).format('L');
  }
}
