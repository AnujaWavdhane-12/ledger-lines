import { Component, Input } from '@angular/core';

@Component({
  selector: 'inbox-conversation-component',
  template: `
    <div>{{ conversation }}</div>
  `,
  styles: [
    `
      .conversation-window {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 16px;
      }
    `,
  ],
})
export class InboxConversationComponent {
  @Input() conversation = '';
}
