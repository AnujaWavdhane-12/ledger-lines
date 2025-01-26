import { Component } from '@angular/core';

@Component({
  selector: 'app-fullscreen-loading-component',
  styles: [
    `
      .fullscreen-loading {
        align-items: center;
        background-color: var(--bs-body-bg);
        display: flex;
        height: 100%;
        left: 0;
        justify-content: center;
        position: fixed;
        top: 0;
        width: 100%;
      }
    `,
  ],
  template: `
    <div class="fullscreen-loading">
      <p-progressSpinner></p-progressSpinner>
    </div>
  `,
})
export class FullscreenLoadingComponent {}
