import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { MenuItem, MessageService } from 'primeng/api';
import { DefaultService, Organization } from 'src/service-sdk';

@Component({
  selector: 'app-organization-create-component',
  providers: [MessageService],
  styles: [
    `
      img.org-logo {
        aspect-ratio: 1/1;
        object-fit: cover;
        width: 100%;
        max-width: 125px;
        border-radius: 6px;
        border: 1px solid var(--primary-color);
      }
    `,
  ],
  template: `
    <p-toast></p-toast>
    <page-template [breadCrumbPaths]="breadCrumb">
      <div>
        <h2>Create Organization</h2>
      </div>
      <hr />

      <p-card styleClass="px-3">
        <form (ngSubmit)="createOrg()">
          <div class="row g-5 row-cols-2">
            <div class="col">
              <label class="form-label" for="name">Organization Name</label>
              <input type="text" class="form-control" id="name" pInputText name="name" [(ngModel)]="organization.name" />
            </div>
          </div>

          <div class="row g-5 mt-2">
            <div class="col col-lg-9">
              <label class="form-label" for="logo-url">Logo Image URL (See Preview on Right)</label>
              <input type="text" class="form-control" id="logo-url" pInputText name="logo-url" [(ngModel)]="organization.logo_url" />
            </div>
            <div class="col col-lg-3 d-flex justify-content-end">
              <img
                class="org-logo"
                src="{{ organization.logo_url ? organization.logo_url : 'assets/images/background-landing-page2-min.png' }}"
                alt="{{ organization.name }} logo" />
            </div>
          </div>

          <button pButton pRipple [loading]="saving" label="Create" class="p-button-success">&nbsp;</button>
        </form>
      </p-card>
    </page-template>
  `,
})
export class CreateOrganizationComponent implements OnInit {
  public breadCrumb: MenuItem[];
  public organization: Organization;
  public saving: boolean;

  public constructor(
    private auth: AuthService,
    private api: DefaultService,
    private titleService: Title,
    private router: Router,
    private messageService: MessageService
  ) {
    this.titleService.setTitle('Organizations');
  }

  ngOnInit(): void {
    this.organization = {};
    this.saving = false;

    this.breadCrumb = [
      {
        label: 'My Organizations',
        routerLink: ['/organization'],
      },
      {
        label: 'Create Organization',
        routerLink: ['/organization', 'Create'],
      },
    ];

    // check auth
    this.auth.isAuthenticated$.subscribe({
      next: (result: boolean) => {
        if (!result) {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  public createOrg(): void {
    this.saving = true;
    //this.api.createOrganization(this.organization).subscribe({
    //  next: (org: { id: number }) => {
    //    this.saving = false;
    //    this.router.navigate(['/organization', org.id]);
    //  },
    //  error: (error) => {
    //    this.saving = false;
    //    console.error(error);
    //    this.messageService.add({
    //      severity: 'error',
    //      summary: 'Error',
    //      detail: 'There was an error creating this organization.',
    //    });
    //  },
    //});
  }
}
