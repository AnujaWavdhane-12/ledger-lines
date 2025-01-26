import { Component, OnInit } from '@angular/core';
import { DefaultService } from 'src/service-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';

/**
 * Any page --> /login --> Auth0 --> /auth-callback?code=abc.. --> Login complete --> Actual target page (no code)
 */
@Component({
  selector: 'app-login-component',
  template: ``,
})
export class LoginComponent implements OnInit {
  public constructor(
    @Inject(DOCUMENT) public document: Document,
    private api: DefaultService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.titleService.setTitle('Login');
  }

  public ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params.code === undefined) {
        this.doLogin();
      }
    });
  }

  public doLogin() {}
}
