import { Component, OnInit } from '@angular/core';
import { DefaultService, User } from 'src/service-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'app-home-component',
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <dashboard-page-component [title]="'home'">
      <h1>Welcome to home</h1>
    </dashboard-page-component>
  `,
})
export class HomeComponent implements OnInit {
  public userDetails: User;
  public savingProject = false;
  public project;
  public orgOptions;

  public constructor(
    @Inject(DOCUMENT)
    public doocument: Document,
    private api: DefaultService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private messageService: MessageService
  ) {
    this.userDetails = new Object() as User;
  }

  public ngOnInit() {}
}
