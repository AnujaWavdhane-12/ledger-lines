import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { DefaultService } from 'src/service-sdk';

@Component({
  selector: 'app-root',
  template: `
    <app-horizontal-menu-component *ngIf="showHorizontalMenu"></app-horizontal-menu-component>

    <app-alerts-component></app-alerts-component>

    <router-outlet></router-outlet>

    <app-footer-component *ngIf="showFooter"></app-footer-component>
  `,
})
export class AppComponent {
  public showHorizontalMenu: boolean;
  public showFooter: boolean;

  public constructor(private api: DefaultService, private router: Router) {
    // this subscription will fire always when the url changes
    this.router.events.subscribe((val) => {
      // the router will fire multiple events
      // we only want to react if it's the final active route

      if (val instanceof NavigationEnd) {
        const urlTree = this.router.parseUrl(this.router.url);
        if (urlTree.root.children.primary !== undefined) {
          const segments = urlTree.root.children.primary.segments;

          // Embedded should not have header or footer
          const isEmbedded = false;

          // Login flow pages should not have header or footer
          const isLoginComponent =
            (segments.length === 1 && segments[0].path === 'login') || segments[0].path === 'auth-callback' || segments[0].path === 'login-complete';

          // Actually show/hide based on the page we are on right now.
          if (isEmbedded || isLoginComponent) {
            this.showFooter = false;
            this.showHorizontalMenu = false;
          } else {
            this.showFooter = true;
            this.showHorizontalMenu = true;
          }
        } else {
          this.showHorizontalMenu = true;
          this.showFooter = true;
        }
      }
    });
  }
}
