import { Component, Output, EventEmitter, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { Client, DefaultService, Organization } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'bank-connection-request-component',
  styles: [
    `
      textarea {
        width: 100%;
      }
    `,
  ],
  template: `
    <p-dialog header="Header" [(visible)]="visible" (onHide)="visibilityChanged()" (onShow)="visibilityChanged()" [modal]="true" [style]="{ width: '60vw' }">
      <ng-template pTemplate="header">
        <h5>Request a connection to {{ client.first_name }}</h5>
      </ng-template>

      <textarea rows="8" pInputTextarea [(ngModel)]="messagePreview" [disabled]="true"></textarea>
      <p>Sent via {{ client?.preferred_communication }}</p>

      <ng-template pTemplate="footer">
        <p-button icon="pi pi-copy" (click)="copyLink()" [loading]="loading" label="Copy link" styleClass="p-button-text"></p-button>
        <p-button icon="pi pi-send" (click)="sendMessage()" [loading]="loading" label="Send" styleClass="p-button-text"></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class BankConnectionRequestComponent implements OnInit, OnChanges {
  @Output() onDataChange = new EventEmitter<() => void>();
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() client: Client = null;
  private generatedLink: string;
  protected messagePreview = '';
  protected loading = false;

  constructor(private api: DefaultService, private alertService: UIAlertsService, private messageService: MessageService) {}

  public ngOnInit() {
    this.generateMessagePreview();
  }

  private generateMessagePreview() {
    this.messagePreview = `Su contador le está invitando a completar su incorporación como cliente. Al conectarse a sus cuentas bancarias comerciales, ellos pueden comenzar a categorizar sus transacciones. Esto le ahorrará tiempo y eliminará la necesidad de enviar información adicional sobre las transacciones.

Para generar su solicitud, necesitaremos integrarnos con su cuenta bancaria. Por favor, conecte su banco en el siguiente enlace: 

${this.generatedLink}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const modalOpened = changes?.visible?.currentValue;
    if (modalOpened) {
      this.requestLink();
    }
  }

  protected copyLink() {
    navigator.clipboard
      .writeText(this.generatedLink)
      .then(() => {
        this.messageService.add({ severity: 'success', summary: 'Link copied to clipboard', detail: 'Link copied to clipboard' });
      })
      .catch((error) => {
        console.error('Failed to copy link to clipboard', error);
        this.messageService.add({ severity: 'error', summary: 'Failed to copy link to clipboard', detail: 'Failed to copy link to clipboard' });
      });
  }

  protected sendMessage() {
    this.loading = true;
    this.requestLink();
  }

  protected visibilityChanged() {
    this.visibleChange.emit(this.visible);
  }

  private requestLink() {
    this.loading = true;
    this.api.getFinancialInstitutionConnectionUrl(this.client.partner_uid, this.client.organization.organization_id).subscribe({
      next: (response) => {
        this.loading = false;
        this.generatedLink = response.plaid_link;
        this.generateMessagePreview();
      },
      error: (error) => {
        this.loading = false;

        // Notify the user that we could not generate the link.
        this.alertService.error('Failed to generate the link');

        // Close this modal.
        this.visible = false;
      },
    });
  }
}
