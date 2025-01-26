import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UIAlertsService } from '../services/uialerts.service';
import { TelemetryService } from '../services/telemetry.service';

export class AlertMessage {
  public constructor(public type: string, public title: string, public message: string, public showOperationId: boolean = true) {}
}

@Component({
  selector: 'app-alerts-component',
  template: `
    <div>
      <p-dialog header="{{ message?.title }}" [(visible)]="alertShowing" [modal]="true" [style]="{ width: '50vw' }" [draggable]="false" [resizable]="false">
        <p>
          {{ message?.message }}
        </p>
        <!--
        <p>Operation ID: {{ operationId }}</p>
-->
        <ng-template pTemplate="footer">
          <p-button icon="pi pi-check" (click)="alertShowing = false" label="Ok" styleClass="p-button-text"></p-button>
        </ng-template>
      </p-dialog>
    </div>
  `,
})
export class AlertsComponent {
  protected message: AlertMessage;
  protected alertClass: string;
  protected alertShowing = false;
  protected operationId = '';

  constructor(private route: ActivatedRoute, private telemetryService: TelemetryService, private router: Router, private alertService: UIAlertsService) {
    this.alertService.getNotificationSubject().subscribe((message) => {
      this.message = message;

      // Get the operation id from the telemetry service, and show it to the user
      const telemetryDetails = this.telemetryService.getAppInsightsDetails()?.getTraceCtx();
      this.operationId = telemetryDetails?.getTraceId() || 'none';

      this.alertShowing = true;
    });
  }
}
