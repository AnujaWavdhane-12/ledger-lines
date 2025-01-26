import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LedgerAccount } from 'src/service-sdk';

@Component({
  selector: 'bulk-categorization-dialog-component',
  template: `
    <p-dialog
      header="Categorize Transactions as"
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      blockScroll
      [style]="{ width: '40vw', minWidth: '300px', height: '70vh', minHeight: '300px' }">
      <ng-template pTemplate="header">
        <h5>Categorize Transactions as</h5>
      </ng-template>
      <p>Choose a category to apply to all selected transactions.</p>
      <p-dropdown [options]="categories" [(ngModel)]="selectedCategory" optionLabel="name"></p-dropdown>

      <ng-template pTemplate="footer">
        <p-button [disabled]="!selectedCategory.category_id" label="Set category" (click)="applyCategory()"></p-button>
        <p-button label="Cancel" (click)="cancel()"></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class BulkCategorizationDialogComponent implements OnInit {
  @Input() visible: boolean;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() categories: LedgerAccount[];
  protected selectedCategory: LedgerAccount;
  @Output() categorySelected = new EventEmitter<LedgerAccount>();

  ngOnInit(): void {
    console.log('BulkCategorizationDialogComponent initialized');
    console.log('model: ', this.selectedCategory);
  }

  applyCategory() {
    if (this.selectedCategory.category_id) {
      this.visible = false;
      this.categorySelected.emit(this.selectedCategory);
      this.selectedCategory = null;
      this.visibleChange.emit(this.visible); // Emit the updated visibility state
    }
  }

  cancel() {
    this.visible = false;
    this.selectedCategory = null;
    this.visibleChange.emit(this.visible); // Emit the updated visibility state
  }
}
