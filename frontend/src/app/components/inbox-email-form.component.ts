import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'inbox-email-form-component',
  template: `
    <div class="email-form">
      <div class="left-column">
        <div class="p-field">
          <label for="to">To:</label>
          <input id="to" type="text" pInputText [(ngModel)]="to" name="to" required />
        </div>
        <div class="p-field">
          <label for="subject">Subject:</label>
          <input id="subject" type="text" pInputText [(ngModel)]="subject" name="subject" required />
        </div>
        <div class="p-field body-field">
          <label for="body">Body:</label>
          <textarea id="body" pInputTextarea [(ngModel)]="body" name="body" required rows="10"></textarea>
        </div>
      </div>
      <div class="right-column">
        <p-fileUpload mode="basic" name="attachment" [auto]="true" accept="image/*,application/*" (onSelect)="onFileSelect($event)"></p-fileUpload>

        <p-button (onClick)="sendEmail()" label="Send"></p-button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100px;
        background-color: #f0f0f0;
      }

      .email-form {
        display: flex;
        flex-direction: row;
      }

      .left-column {
        margin: 15px;
        flex: 9;
        min-width: 500px;
        display: flex;
        flex-direction: column;
      }

      .right-column {
        flex: 1;
        display: flex;
        padding: 10px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      }

      .form-group {
        display: flex;
        align-items: left;
      }

      label {
        font-weight: bold;
      }

      input,
      textarea {
        width: 100%;
        padding: 5px;
      }
      textarea {
        height: 100px;
      }

      .body-field {
        flex-grow: 1;
      }

      p-button,
      p-fileUpload {
        align-self: flex-start;
        padding: 8px 8px;
        margin: 5px;
        color: white;
        border: none;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class InboxEmailFormComponent {
  protected to = '';
  protected subject = '';
  protected body = '';
  protected attachment: File | null = null;
  protected userDetails: any = {};

  public constructor(
    @Inject(DOCUMENT)
    public doocument: Document
  ) {}

  onFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.attachment = event.files[0];
    }
  }

  async ngOnInit() {
    // Get the current user information
    //this.auth.user$.subscribe((user) => {
    //  console.log('loaded user details', user);
    //  this.userDetails = user;
    //});
  }

  async sendEmail() {
    console.log('Sending message.');

    // http call to web sevice, do a raw post request
    // picture is here: picture

    const noticactionBody = {
      transaction_id: 1,
      suggestedCategoryId: '1',
      suggestedCategory: `${this.userDetails?.given_name} >  ${this.body}`,
    };

    const url = `${environment.backendUrl}/triggerWebsocketNotifications`;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(noticactionBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.body = '';
  }
}
