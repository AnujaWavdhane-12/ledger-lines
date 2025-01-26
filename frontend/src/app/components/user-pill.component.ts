import { Component, Input } from '@angular/core';
import { Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { User } from 'src/service-sdk';

@Component({
  selector: 'user-pill-component',
  styles: [
    `
      .name {
        font-size: 10px;
      }
    `,
  ],
  template: `
    <!-- TODO: Change this to flexbox -->
    <table>
      <tr>
        <td rowspan="2">
          <p-avatar label="{{ user?.first_name.charAt(0) }}"></p-avatar>
        </td>
      </tr>
      <tr>
        <td class="name">
          <div>{{ user?.first_name }}</div>
        </td>
      </tr>
    </table>
  `,
})
export class UserPillComponent {
  @Input() user: User;

  public constructor(
    @Inject(DOCUMENT)
    public document: Document
  ) {}
}
