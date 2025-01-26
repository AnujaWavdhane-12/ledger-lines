import { Component, Output, EventEmitter, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { Client, DefaultService, Organization } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'client-create-component',
  styles: [],
  template: `
    <p-dialog header="Header" [(visible)]="visible" (onHide)="visibilityChanged()" (onShow)="visibilityChanged()" [modal]="true" [style]="{ width: '70vw' }">
      <ng-template pTemplate="header">
        <h5>Add a Client</h5>
      </ng-template>

      <client-details-form-component [loading]="loading" [(client)]="createClientRequest"></client-details-form-component>

      <ng-template pTemplate="footer">
        <p-button icon="pi pi-check" [loading]="loading" (click)="addClient()" label="Ok" styleClass="p-button-outline"></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class ClientCreateComponent implements OnInit {
  @Output() onDataChange = new EventEmitter<() => void>();

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  protected createClientRequest: Client;
  protected loading = false;

  constructor(private api: DefaultService, private alertService: UIAlertsService, private messageService: MessageService) {
    this.createClientRequest = new Object() as Client;
    this.createClientRequest.organization = new Object() as Organization;
  }

  protected visibilityChanged() {
    this.visibleChange.emit(this.visible);
  }

  public ngOnInit() {}

  protected addClient() {
    this.loading = true;
    this.api.createClient(this.createClientRequest).subscribe({
      next: (response) => {
        console.log(response);
        this.loading = false;
        this.visible = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client created' });
        this.onDataChange.emit();
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        this.alertService.error('Error', 'There was an error creating the client');
      },
    });
  }
}
