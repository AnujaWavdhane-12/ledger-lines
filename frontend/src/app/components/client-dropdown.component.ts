import { Component, Output, EventEmitter, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { Client } from 'src/service-sdk';

@Component({
  selector: 'client-dropdown-component',
  template: `
    <p-dropdown
      [options]="clients"
      [(ngModel)]="selectedClient"
      optionLabel="name"
      [autoDisplayFirst]="false"
      [showClear]="true"
      [filter]="true"
      filterBy="first_name,last_name,organization.name"
      filterValue="first_name"
      (onChange)="emitActionTaken()"
      [placeholder]="selectedClient ? selectedClient.first_name : 'Select a client'">
      <ng-template pTemplate="selectedItem">
        <div class="flex align-items-center gap-2" *ngIf="selectedClient">
          <div>{{ selectedClient.first_name }}</div>
        </div>
      </ng-template>

      <ng-template let-selectedClient pTemplate="item">
        <div class="flex align-items-center gap-2">
          <div>{{ selectedClient.first_name }} {{ selectedClient.last_name }} ({{ selectedClient.organization.name }})</div>
        </div>
      </ng-template>
    </p-dropdown>
  `,
})
export class ClientDropdownComponent implements OnInit, OnChanges {
  @Input() partnerId: number;
  @Input() clients: Client[];

  protected selectedClient: Client;
  @Output() onDataChange = new EventEmitter<Client>();

  public isLoading = false;

  public emitActionTaken() {
    if (!this.isLoading) {
      this.onDataChange.emit(this.selectedClient);
    }
  }

  public ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {}
}
