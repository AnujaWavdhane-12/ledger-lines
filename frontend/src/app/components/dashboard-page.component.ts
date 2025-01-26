import { Component, Input, OnInit } from '@angular/core';
import { DefaultService } from 'src/service-sdk';
import { Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { MenuItem, MessageService } from 'primeng/api';
import { PostHogService } from '../services/posthog.service';

@Component({
  selector: 'dashboard-page-component',
  styles: [
    `
      section.breadcrumb {
        padding-bottom: 0px !important;
        text-transform: uppercase;
      }

      :host ::ng-deep .p-menu {
        border: 0;
      }
    `,
  ],
  template: `
    <p-toast></p-toast>

    <div class="no-bottom pt-6" id="content">
      <div id="top"></div>

      <section>
        <div class="container">
          <div class="row inbox-wrapper"></div>
          <div class="row">
            <div class="col-lg-12">
              <div class="card">
                <div class="card-body">
                  <div class="row"></div>
                  <div class="row">
                    <div class="col-lg-12">
                      <ng-content></ng-content>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,

  providers: [MessageService],
})
export class DashboardPageComponent implements OnInit {
  @Input() intermediatePaths: MenuItem[];
  @Input() title: string;
  @Input() showHorizontalMenu: boolean;

  protected generateLinkLoading = true;
  protected invitationLinkAvailable = false;
  protected projectDetails;
  public home: MenuItem;
  public horizontalMenuItems: MenuItem[];
  public items: MenuItem[] | undefined;
  public paths: MenuItem[];
  public showProjectDropdown = false;

  public constructor(
    @Inject(DOCUMENT)
    public document: Document,
    private api: DefaultService,
    private messageService: MessageService,
    private posthogService: PostHogService,
    private route: ActivatedRoute
  ) {}

  public async ngOnInit() {
    this.home = {
      icon: 'pi pi-home',
      routerLink: '/clients', //need to change back to home before final deployment
    };

    this.showHorizontalMenu ??= false;

    this.route.params.subscribe((params) => {
      this.paths = [
        ...(this.intermediatePaths || []),
        {
          label: this.title,
        },
      ];

      this.loadBigHorizontalMenuItems(0);
    });
  }

  private async loadBigHorizontalMenuItems(inboxCount: number) {
    const items: MenuItem[] = [
      {
        label: 'Clients',
        icon: 'pi pi-users',
        routerLink: '/clients',
      },
      {
        label: 'Transactions',
        icon: 'pi pi-briefcase',
        routerLink: '/transactions',
      },
      // Not ready yet
      //{
      //  label: 'Settings',
      //  icon: 'pi pi-cog',
      //  routerLink: '/settings',
      //},
    ];

    const isCommunicationsHubEnabled = await this.posthogService.isFeatureEnabled('communications-hub');
    if (isCommunicationsHubEnabled) {
      items.splice(2, 0, {
        badge: inboxCount > 0 ? inboxCount.toString() : '2',
        label: 'Inbox',
        icon: 'pi pi-chart-bar',
        routerLink: '/inbox',
      });
    }

    this.horizontalMenuItems = items;
  }
}
