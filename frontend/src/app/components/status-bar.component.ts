import { Component } from '@angular/core';

@Component({
  selector: 'app-recruiter-status-bar-component',
  styles: [
    `
      .status-bar {
        background-color: var(--surface-b);
        border-bottom: 1px solid var(--surface-d);
        border-top: 1px solid var(--surface-d);
        font-weight: bold;
        margin-top: 10px;
        padding: 15px 20px;
      }
    `,
  ],
  template: `
    <div class="status-bar">
      <ng-content></ng-content>
    </div>
  `,
})
export class RecruiterStatusBarComponent {
  constructor() {
    // nothing
  }
}
