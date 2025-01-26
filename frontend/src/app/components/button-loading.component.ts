import { Component, Output, EventEmitter, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-button-loading-component',
  styles: [
    `
      .disabled {
        background-color: gray;
      }
    `,
  ],
  template: `
    <button class="btn-main" [ngClass]="{ disabled: loading }" (click)="action()">
      <ng-container *ngIf="isLoading">
        <i class="fa fa-circle-o-notch fa-spin"></i>
        &nbsp;{{ caption }}
      </ng-container>

      <ng-container *ngIf="!isLoading">
        {{ caption }}
      </ng-container>
    </button>
  `,
})
export class LoadingButtonComponent implements OnInit, OnChanges {
  @Input() loading: boolean;

  @Input() caption: string;

  @Output() clicked = new EventEmitter();

  public isLoading = false;

  public action() {
    if (!this.loading) {
      this.clicked.emit();
    }
  }

  public ngOnInit() {
    this.isLoading = this.loading === true;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isLoading = this.loading === true;
  }
}
