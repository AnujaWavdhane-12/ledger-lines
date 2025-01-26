import { Component, Input, SimpleChanges, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { Client, DefaultService, Organization } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import moment from 'moment';

@Component({
  selector: 'client-shares-form-component',
  styles: [
    `
      :host ::ng-deep .p-panel-content {
        border: 0;
        padding: 1.5rem;
      }

      .row {
        align-items: center;
      }

      .label-text {
        font-size: 0.9rem;
        color: #666;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .share-section {
        margin-bottom: 1.5rem;
      }

      :host ::ng-deep .p-multiselect {
        width: 100%;
      }

      :host ::ng-deep .p-chips {
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
        <div class="share-section">
          <div class="label-text">Add one or more partners</div>
          <small class="text-muted mb-2 d-block">Separate emails by comma or press Enter</small>
          <div class="row">
            <div class="col-12">
              <p-chips
                [(ngModel)]="targetPartnerSelected"
                (onAdd)="targetPartnerSelectedChange.emit(targetPartnerSelected)"
                placeholder="Enter email addresses"
                separator=","
                #emailInput="ngModel"
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                required></p-chips>
              <div *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)" class="text-danger">
                <small *ngIf="emailInput.errors?.['required']">At least 1 email adress is required.</small>
                <small *ngIf="emailInput.errors?.['pattern']">incorrect email format</small>
              </div>
            </div>
          </div>
        </div>

        <div class="share-section">
          <div class="label-text">Select clients to share</div>
          <div class="row">
            <div class="col-12">
              <p-multiSelect
                [(ngModel)]="selectedClientList"
                (onChange)="clientsSelected.emit(selectedClientList)"
                [options]="clients"
                [optionLabel]="'first_name'"
                placeholder="Choose clients to share"
                appendTo="body"
                #multiSelect="ngModel"
                [showHeader]="false">
                <ng-template let-client pTemplate="item">{{ client.first_name }} {{ client.last_name }}</ng-template>
              </p-multiSelect>
              <div *ngIf="multiSelect.invalid && multiSelect.touched" class="text-danger">
                <small *ngIf="multiSelect.errors?.['required']">At least 1 email adress is required.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </p-panel>
  `,
})
export class ClientSharesFormComponent implements OnInit {
  @Input() clients: Client[] = [];
  @Input() targetPartnerSelected: any[] = [];
  @Input() loading = false;
  @Output() clientsSelected = new EventEmitter<Client[]>();
  @Output() targetPartnerSelectedChange = new EventEmitter<any[]>();

  protected selectedClientList: Client[] = [];

  public ngOnInit() {}

  constructor(private api: DefaultService, private alertService: UIAlertsService) {}
}
