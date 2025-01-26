import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'page-template',
  styles: [],
  template: `
    <div class="no-bottom pt-6" id="content">
      <div id="top"></div>

      <section class="breadcrumb" *ngIf="breadCrumbPaths">
        <div class="container">
          <div>
            <p-breadcrumb class="max-w-full" [model]="breadCrumbPaths" [home]="breadCrumbHome"></p-breadcrumb>
          </div>
        </div>
      </section>

      <section style="min-height: 70vh;">
        <div class="container">
          <div class="row inbox-wrapper">
            <div class="col-lg-12">
              <div class="card">
                <div class="card-body">
                  <ng-content></ng-content>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class PageTemplate implements OnInit {
  @Input() breadCrumbPaths: MenuItem[];

  public breadCrumbHome: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/',
  };

  ngOnInit(): void {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
}
