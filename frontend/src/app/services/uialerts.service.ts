import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AlertMessage } from '../components/alerts.component';

//
// There are two types of error messages:
//    - Notifications that show up on the top right, and dissapear after a few seconds.
//
//      To trigger a notification:
//        private messageService: MessageService,
//        this.messageService.add({
//          severity: 'warn',
//          summary: 'Unable to open problem',
//          detail: prereqError?.reason || prereqError?.error || 'Pre-requisites failed',
//        });
//
//    - Alerts that overlay everything and have a "Close" button.
//
//      To trigger an alert:
//        alerts.error(title, message);
//
//   /-----------------------\          /----------\    /-----------\
//   |   Global Error Handler|   ---->  |          |    |           | --> Show via PrimeNG's p-dialog.
//   \-----------------------/          | THIS**   |    | Alerts    |
//                                      | Service  |--->| Component |     /-------------------------\
//   /-----------------------\          |          |    |           | --> |PrimeNG's MessageService |
//   |  Components or pages  |   ---->  |          |    |           |     \-------------------------/
//   \-----------------------/          \----------/    \-----------/
//
@Injectable({
  providedIn: 'root',
})
export class UIAlertsService {
  private notificationSubject = new Subject<AlertMessage>();

  /**
   * This is what calls the UI
   *
   * @param type The type of message
   * @param message The actual message
   */
  private notify(type: string, title: string, message: string) {
    this.notificationSubject.next(new AlertMessage('Error', title, message, true));
  }

  getNotificationSubject() {
    return this.notificationSubject.asObservable();
  }

  public error(messageOrError: any, title: string = null) {
    if (messageOrError instanceof HttpErrorResponse) {
      // This is an error from the API
      const errorText = messageOrError?.error?.error;

      // Maybe only show this for errors from our api?
      this.notify('Error', title || 'Error', errorText);
    } else if (messageOrError?.error === 'login_required') {
      // Sometimes we will see errors with aut0 failing with login_required.
      // Not sure what to do here other than redirect to login.
    } else if (messageOrError === undefined) {
      this.notify('Error', title || 'Error', 'Something went wrong');
    } else if (typeof messageOrError === 'string') {
      this.notify('Error', title || 'Error', messageOrError);
    } else if (messageOrError.error !== undefined && messageOrError.error.reason !== undefined) {
      // This might be a HttpErrorResponse from our API
      this.notify('Error', title || 'Error', messageOrError.error.reason);
    } else if (messageOrError.message !== undefined) {
      // This might be a HttpErrorResponse
      this.notify('Error', title || 'Error', messageOrError.message);
    } else {
      this.notify('Error', title || 'Error', 'Something went wrong');
    }
  }
}
