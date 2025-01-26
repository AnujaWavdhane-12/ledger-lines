import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PrivateApi } from '../services/privateApi.service';

@Component({
  selector: 'app-footer-component',
  template: `
    <!-- footer begin -->
    <footer *ngIf="showFooter" class="theme-footer">
      <div class="container">
        <div class="row">
          <div class="col-md-3 col-sm-6 col-xs-1">
            <div class="widget">
              <h5>General</h5>
              <ul>
                <li>
                  <a href="">Careers</a>
                </li>
                <li><a href="">Contact Us</a></li>
                <li><a [routerLink]="['/privacy']">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-1">
            <div class="widget">
              <h5>Community</h5>
              <ul>
                <li>
                  <a href="">LinkedIn</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-1">
            <div class="widget"></div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-1">
            <div class="widget">
              <h5>Newsletter</h5>
              <p>Signup for our newsletter to get the latest news in your inbox.</p>
              <form action="blank.php" class="row form-dark" id="form_subscribe" method="post" name="form_subscribe">
                <div class="col text-center">
                  <!-- add spinner upon button click class="spinner-border spinner-border-sm" -->
                  <div class="p-inputgroup">
                    <input
                      [disabled]="isDisabled"
                      [(ngModel)]="userEmail"
                      class="form-control"
                      id="txt_subscribe"
                      name="txt_subscribe"
                      placeholder="enter your email"
                      type="text" />
                    <button id="btn-subscribe" (click)="sendEmail()" type="button" pButton icon="pi pi-plus" aria-label="Subscribe to Newsletter"></button>
                  </div>
                  <div class="clearfix"></div>
                </div>
              </form>
              <div class="spacer-10"></div>
              <small>Your email is safe with us. We don't spam.</small>
            </div>
          </div>
        </div>
      </div>
      <div class="subfooter">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="de-flex">
                <div class="de-flex-col">
                  <a [routerLink]="['/']">
                    <img alt="" class="f-logo" src="" />
                    <span class="copy">&copy; Copyright {{ year }}. All rights reserved.</span>
                  </a>
                </div>
                <div class="de-flex-col">
                  <div class="social-icons">
                    <a href="">
                      <i class="fa fa-linkedin fa-lg"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!-- footer close -->
  `,
})
export class AppFooterComponent {
  public showFooter = false;
  public userEmail: string;
  public isDisabled = false;
  public year = new Date().getFullYear();

  public constructor(private router: Router, private privateApi: PrivateApi) {
    this.userEmail = '';
  }

  public sendEmail() {
    this.isDisabled = true;
    this.privateApi.addUserToNewsletter(this.userEmail).subscribe({
      next: () => {
        this.isDisabled = false;
        this.userEmail = '';
        alert("You've successfully subscribed to the newsletter.");
      },
      error: (error) => {
        console.error(error);
        this.isDisabled = false;
        alert(error.statusText);
      },
    });
  }
}
