import { Component, OnInit } from '@angular/core';
import { DefaultService, User } from 'src/service-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { mergeMap } from 'rxjs';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-inbox-component',
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <dashboard-page-component [title]="'inbox'">
      <h1>Welcome to inbox</h1>
      <div class="inbox-container">
        <div class="left-column">
          <inbox-contact-list-component></inbox-contact-list-component>
        </div>
        <div class="right-column">
          <inbox-conversation-component [conversation]="conversation"></inbox-conversation-component>
          <inbox-email-form-component></inbox-email-form-component>
        </div>
      </div>
    </dashboard-page-component>
  `,
  styles: [
    `
      .inbox-container {
        margin-top: 20px;
        display: flex;
        width: 100%;
        height: 80vh;
        max-height: 600px;
        gap: 20px;
      }

      .left-column {
        flex: 1;
        max-width: 300px; /* Adjust as needed */
        overflow: hidden;
      }

      .right-column {
        flex: 3;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      inbox-contact-list-component {
        min-height: 0;
        max-height: 550px;
        overflow-y: auto;
        border: 1px solid #ccc;
      }

      inbox-conversation-component {
        flex: 1;
        min-height: 0; /* This is crucial for proper flexbox behavior */
        border: 1px solid #ccc;
        overflow-y: auto;
      }

      inbox-email-form-component {
        flex: 1;
        min-height: 0; /* This is crucial for proper flexbox behavior */
        border: 1px solid #ccc;
        overflow-y: auto;
      }
    `,
  ],
})
export class InboxComponent implements OnInit {
  public userDetails: User;
  public savingProject = false;
  public project;
  public orgOptions;
  protected conversation = 'Getting ready...';

  public constructor(
    @Inject(DOCUMENT)
    public doocument: Document,
    private api: DefaultService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private messageService: MessageService,
    private websocketService: WebSocketService
  ) {
    this.userDetails = new Object() as User;
  }

  public async wait() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  public async ngOnInit() {
    // wait for connection to be ready
    await this.wait();
    this.conversation += 'Ready.\n';

    this.websocketService.subscribeToChangesInTransactionIndefinitely(1, (message) => {
      console.log('Received message:', message);
      this.conversation += message.suggestedCategory + '\n';
    });
  }
}
