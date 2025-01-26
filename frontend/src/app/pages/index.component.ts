import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-index-component',
  styles: [
    `
      .center {
        display: flex;
        justify-content: center;
      }
    `,
  ],
  template: `
    <page-template>
      <section aria-label="section">
        <div class="container">
          <div class="row">
            <div class="col-md-8 offset-md-2">
              <h1>Increase productivity, and achieve more fulfilling work.</h1>
              <p>
                Harness the power of AI to automate tedious tasks, free up your time for what matters most: growing your business, improving client
                satisfaction, and enjoying your work.
              </p>

              <div class="center">
                <p-button [routerLink]="['/login']" label="Login to start" styleClass="p-button-outlined p-button-sm"></p-button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </page-template>
  `,
  providers: [MessageService],
})
export class IndexComponent implements OnInit {
  protected isLoggedIn = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = true;

    //this.auth.user$.subscribe(async (userDetails) => {
    //  if (userDetails) {
    //    this.isLoggedIn = true;
    //    this.router.navigate(['/clients']);
    //  }
    //});
  }
}
