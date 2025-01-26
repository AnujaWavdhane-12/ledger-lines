import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { MenuItem, MessageService } from 'primeng/api';
import { DefaultService, Organization, User } from 'src/service-sdk';
import { UIAlertsService } from '../services/uialerts.service';

@Component({
  selector: 'organization-component',
  providers: [MessageService],
  styles: [``],
  template: `
    <p-toast></p-toast>
    <dashboard-page-component [title]="'Organizations'" [horizontalMenuItemsRequired]="false">
      <div>
        <h2>My Organizations</h2>
      </div>
      <hr />
      <organization-list-component
        [organizationClients]="organizationClients"
        [organizations]="organization"
        [loading]="isLoading"
        [user]="this.userDetails"></organization-list-component>
    </dashboard-page-component>
  `,
})
export class OrganizationComponent implements OnInit {
  public breadCrumb: MenuItem[];
  protected organization: Organization[];
  protected organizationClients: { [organizationId: number]: any[] } = {};
  protected isLoading = false;
  protected userDetails: User;

  public constructor(
    private auth: AuthService,
    private api: DefaultService,
    private titleService: Title,
    private router: Router,
    private messageService: MessageService,
    private alertService: UIAlertsService
  ) {
    this.userDetails = new Object() as User;
    this.titleService.setTitle('Organizations');
  }

  ngOnInit(): void {
    this.loadUser();

    this.breadCrumb = [
      {
        label: 'My Organizations',
        routerLink: ['/organization'],
      },
    ];

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

  private loadUser() {
    this.isLoading = true;
    this.auth.user$.subscribe(async (user) => {
      this.userDetails.auth0_user_id = user.sub;
      this.api.getUserByAuth0Id(this.userDetails.auth0_user_id).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.userDetails = response;
          this.loadOrganizations();
        },
        error: (error) => {
          this.isLoading = false;
          console.log(error);
        },
      });
    });
  }

  private loadOrganizationsClients(organizations: Organization[]) {
    this.isLoading = true;
    organizations.forEach((org) => {
      this.api.getOrganizationClients(org.organization_id).subscribe({
        next: (response) => {
          this.organizationClients[org.organization_id] = response;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.alertService.error('Error', error);
        },
      });
    });
  }

  private loadOrganizations() {
    this.api.getOrganizationsForPartner(this.userDetails.partner_id).subscribe({
      next: (orgs) => {
        this.organization = orgs;
        this.loadOrganizationsClients(this.organization);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
