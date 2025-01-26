import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UIAlertsService } from 'src/app/services/uialerts.service';
import { DefaultService } from 'src/service-sdk';
import { LOCALE_ID, Inject } from '@angular/core';
import { TelemetryService } from 'src/app/services/telemetry.service';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-horizontal-menu-component',
  providers: [DialogService],
  styles: [
    `
      ::ng-deep .p-menu-overlay.fixed-menu {
        display: block !important;
        position: fixed;
        top: 55px !important;
      }

      .account {
        grid-area: account;
      }

      .container {
        align-items: center;
        display: grid;
        gap: 0 15px;
        grid-template-areas: 'logo spacer main-menu account';
        grid-template-columns: auto 1fr auto auto;
        grid-template-rows: auto;
        height: fit-content;
      }

      .main-menu {
        font-family: var(--title-font);
        font-size: 14px;
        margin: 0;
        padding: 5px 0 0 0;
      }

      .main-menu .pi {
        margin-left: 5px;
        cursor: pointer;
      }

      .main-menu a {
        padding-right: 15px;
        padding-left: 5px;
      }

      .main-menu li {
        display: inline;
        position: relative; /* For the dropdown */
      }

      .main-menu li ul {
        height: auto;
        left: 0px;
        opacity: 0;
        position: absolute;
        visibility: hidden;
        width: 180px;
        z-index: 10;
      }

      .main-menu li .expand-icon::before {
        color: var(--gray-600);
        content: '\\f078';
        font-family: FontAwesome;
        font-size: 8px;
        position: relative;
        top: -2px;
      }

      .main-menu li:hover > ul {
        opacity: 1;
        visibility: visible;
      }

      .main-menu ul {
        background-color: var(--surface-0);
        border-radius: 5px;
        margin: 0;
        overflow: hidden;
        padding: 0;
      }

      .menu-button {
        align-items: center;
        display: none;
        grid-area: menu-button;
      }

      .user-avatar {
        border: 2px var(--midnight-blue);
        border-style: groove;
      }

      @media screen and (max-width: 993px) {
        .container {
          grid-template-areas:
            'logo spacer account menu-button'
            'main-menu main-menu main-menu main-menu';
          grid-template-columns: auto 1fr auto;
        }

        .menu-button {
          display: flex;
        }

        .main-menu {
          display: none;
          padding: 15px;
        }

        .main-menu.show {
          display: block;
        }

        .main-menu a {
          display: block;
          width: 100%;
        }

        .main-menu li {
          border-bottom: solid 1px #eee;
          display: block;
        }

        .main-menu li ul {
          height: 0;
          overflow: hidden;
          position: relative;
          left: 0;
        }

        .main-menu li.show-child ul {
          height: auto;
          opacity: 1;
          visibility: visible;
        }

        .main-menu li.show-child .expand-icon::before {
          content: '\\f077';
        }

        .main-menu .expandable {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }

        .main-menu .icon::before {
          top: 0;
        }
      }
    `,
  ],
  templateUrl: 'horizontal-menu.component.html',
})
export class HorizontalMenuComponent implements OnInit {
  public userDetails = null;
  public userAuthenticated = false;
  public profileMenuItems: MenuItem[];
  public showMainMenu = false;
  protected isAuthenticated = true;

  public ngOnInit() {
    //this.auth.user$.subscribe((userDetails) => {
    //  this.userDetails = userDetails;
    //  if (this.userDetails) {
    //    // User is authenticated; let's call the backend to create the user.
    //    this.profileMenuItems = [
    //      {
    //        label: userDetails.name,
    //        items: [
    //          {
    //            label: 'Organizations',
    //            icon: 'pi pi-fw pi-sitemap',
    //            routerLink: ['/organization'],
    //          },
    //          {
    //            label: 'Sign Out',
    //            icon: 'pi pi-fw pi-sign-out',
    //            command: () => {
    //              this.doLogout();
    //            },
    //          },
    //        ],
    //      },
    //    ];
    //  }
    //});
    //this.auth.isAuthenticated$.subscribe({
    //  next: (isAuthenticated) => {
    //    // Change of authentication triggered
    //    this.userAuthenticated = isAuthenticated;
    //  },
    //  error: (error) => {
    //    throw error;
    //  },
    //});
  }

  public constructor(
    @Inject(LOCALE_ID) locale: string,
    private router: Router,
    private api: DefaultService,
    private telemetryService: TelemetryService,
    private alerts: UIAlertsService,
    private dialogService: DialogService
  ) {}

  public cta(title: string) {
    this.telemetryService.logEvent(`CTA_CLICKED_${title}`, {});
  }

  public doLogout() {
    //this.auth.logout({
    //  logoutParams: { returnTo: document.location.origin },
    //});
  }

  public toggleMainMenu() {
    this.showMainMenu = !this.showMainMenu;
  }
}
