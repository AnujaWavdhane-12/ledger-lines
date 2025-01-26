import { Component, Input } from '@angular/core';
import { Client, DefaultService, Organization, User } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'organization-list-component',
  styles: [
    `
      .org-logo {
        aspect-ratio: 1/1;
        object-fit: cover;
        width: 100%;
        max-width: 125px;
        min-width: 30px;
        border-radius: 6px;
        border: 1px solid var(--primary-color);
      }
      .p-card-title,
      .p-card-subtitle {
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      .org-details-link pi {
        width: 20rem;
      }
    `,
  ],
  template: `
    <div *ngIf="loading; else content" class="d-flex align-items-center justify-content-center">
      <p-progressSpinner></p-progressSpinner>
    </div>

    <ng-template #content>
      <div *ngFor="let org of organizations" class="mb-3">
        <p-card>
          <div class="row align-items-center">
            <!-- Logo and Basic Info -->
            <div class="col-lg-9">
              <div class="d-flex align-items-center">
                <img [src]="org.logo_url || 'assets/images/logo-teal.png'" class="org-logo me-4" [alt]="org.name + ' logo'" (error)="onImageError($event)" />
                <div *ngIf="!(selectedOrganization.organization_id === org.organization_id && editing)">
                  <div class="p-card-title mb-2">{{ org.name }}</div>
                  <div class="p-card-subtitle">{{ org.industry }}</div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="col-lg-3 text-end">
              <div class="d-flex gap-2 justify-content-end">
                <a class="p-button p-button-outlined" [href]="org.web_url" target="_blank" rel="noopener noreferrer">
                  <i class="pi pi-external-link"></i>
                </a>
                <p-button
                  [icon]="editing ? 'pi pi-check' : 'pi pi-sliders-v'"
                  [label]="editing ? 'Save' : 'Update'"
                  [loading]="loading"
                  (click)="editing ? updateOrganization(org) : toggleEditMode(org)"></p-button>
                <p-button *ngIf="editing" icon="pi pi-times" styleClass="p-button-danger" (click)="toggleEditMode(org)"></p-button>
              </div>
            </div>
          </div>

          <!-- Edit Form -->
          <div *ngIf="selectedOrganization.organization_id === org.organization_id && editing" class="row mt-4">
            <div class="col-md-6 mb-3">
              <label class="d-block mb-2">Name</label>
              <input pInputText [(ngModel)]="selectedOrganization.name" placeholder="{{ org.name }}" class="w-100" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="d-block mb-2">Industry</label>
              <input pInputText [(ngModel)]="selectedOrganization.industry" placeholder="{{ org.industry }}" class="w-100" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="d-block mb-2">Logo URL</label>
              <input pInputText [(ngModel)]="selectedOrganization.logo_url" placeholder="{{ org.logo_url }}" class="w-100" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="d-block mb-2">Web URL</label>
              <input pInputText [(ngModel)]="selectedOrganization.web_url" placeholder="{{ org.web_url }}" class="w-100" />
            </div>
          </div>

          <!-- Clients Box -->
          <div class="row mt-3">
            <div class="col-12">
              <div class="border rounded p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h5 class="mb-0">Clients</h5>
                </div>

                <!-- Client List -->
                <div *ngIf="organizationClients[org.organization_id]">
                  <div *ngFor="let client of organizationClients[org.organization_id]" class="mb-2">
                    <div class="d-flex align-items-center p-2 border rounded">
                      <i class="pi pi-user me-2"></i>
                      {{ client.first_name }} {{ client.last_name }}
                    </div>
                  </div>
                </div>

                <!-- No Clients Message -->
                <div *ngIf="!organizationClients[org.organization_id]" class="text-muted">
                  No Clients in the organization for now, Click refresh to load clients
                </div>
              </div>
            </div>
          </div>
        </p-card>
      </div>
    </ng-template>
  `,
})
export class OrganizationListComponent {
  @Input() organizations: Organization[];
  @Input() loading?: boolean;
  @Input() user: User;
  protected createOrganizationRequest: Organization;
  protected editing = false;
  protected selectedOrganization: Organization;
  @Input() organizationClients: { [organizationId: number]: any[] };

  constructor(private api: DefaultService, private alertService: UIAlertsService, private messageService: MessageService) {}

  public ngOnInit() {
    this.selectedOrganization = new Object() as Organization;
  }

  toggleEditMode(org: Organization) {
    this.selectedOrganization = { ...org };
    this.editing = !this.editing;
  }

  updateOrganization(org: Organization) {
    this.loading = true;

    this.api.editOrganization(this.selectedOrganization, this.selectedOrganization.organization_id, this.user.partner_id).subscribe({
      next: (response) => {
        org.name = this.selectedOrganization.name;
        org.industry = this.selectedOrganization.industry;
        org.logo_url = this.selectedOrganization.logo_url;
        org.web_url = this.selectedOrganization.web_url;
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Organization updated' });
        this.editing = false;
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error('Error', 'There was an error updating the organization');
      },
    });
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/logo-teal.png';
  }
}
