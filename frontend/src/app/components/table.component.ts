import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-table-component',
  styles: [
    `
      :host ::ng-deep .p-badge {
        align-items: center;
        display: flex;
        justify-content: center;
        margin: 0 auto;
        width: fit-content;
      }

      :host ::ng-deep .p-badge,
      .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :host ::ng-deep .p-button {
        padding: 2px 10px;
        white-space: nowrap;
      }

      :host ::ng-deep .p-component {
        font-family: var(--body-font);
      }

      :host ::ng-deep .p-datatable > div {
        border: 1px solid var(--surface-d);
        border-radius: var(--border-radius);
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
        transition: background-color 0.25s;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
        background-color: var(--surface-d);
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:last-child td {
        border-bottom: none;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td,
      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        max-width: 300px;
        padding: 0.5rem;
      }

      :host ::ng-deep .p-datatable-thead > tr > th {
        max-width: 100px;

        div {
          display: flex;
          align-items: center;
          white-space: normal;
        }
      }

      :host ::ng-deep .p-datatable-thead {
        flex-direction: row;
        border-bottom-width: 0 !important;
      }

      :host ::ng-deep .p-paginator-bottom {
        border: none;
      }

      .overflow-auto {
        scrollbar-width: none;
      }

      .overflow-auto::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
  template: `
    <div *ngIf="loading; else content" class="d-flex align-items-center justify-content-center">
      <p-progressSpinner></p-progressSpinner>
    </div>

    <ng-template #content>
      <p-table
        [scrollable]="true"
        [columns]="columns"
        [value]="value"
        [reorderableColumns]="true"
        [resizableColumns]="true"
        [paginator]="true"
        [rows]="50"
        [rowsPerPageOptions]="[10, 25, 50, 100]"
        [showCurrentPageReport]="true"
        [sortField]="defaultSortField"
        [sortOrder]="defaultSortOrder"
        [(selection)]="selectedProducts"
        selectionMode="multiple"
        styleClass="p-datatable-sm"
        columnResizeMode="expand"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
        <ng-template pTemplate="header" let-columns>
          <tr>
            <th *ngIf="showCheckbox">
              <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
            </th>
            <th *ngFor="let col of columns" pReorderableColumn pResizableColumn [pSortableColumn]="col.field">
              <div>
                {{ col.header }}
                <p-sortIcon *ngIf="col.field" [field]="col.field"></p-sortIcon>
              </div>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-editing="editing" let-rowData let-columns="columns" let-i="rowIndex" let-ri="rowIndex">
          <tr>
            <td *ngIf="showCheckbox">
              <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
            </td>

            <td *ngFor="let col of columns" [ngStyle]="col.getStyle ? col.getStyle(rowData) : {}">
              <span *ngIf="!col.tag" [class]="col.styleClass" [title]="col.getValue ? col.getValue(rowData, i) : rowData[col.field]">
                {{ (col.getValue ? col.getValue(rowData, i) : rowData[col.field]) || '-' }}
              </span>

              <p-avatar *ngIf="col.tag === 'p-avatar'" image="{{ rowData.logo_url }}" styleClass="mr-2" shape="circle"></p-avatar>

              <i *ngIf="col.tag === 'i'" [class]="'pi pi-' + col.getValue(rowData, i)"></i>

              <p-badge *ngIf="col.tag === 'p-badge'" [value]="col.getValue(rowData, i)"></p-badge>

              <p-button
                *ngIf="col.tag === 'p-button'"
                [icon]="getStringOrFunctionResult(col.icon, rowData)"
                [label]="getStringOrFunctionResult(col.label, rowData)"
                [loading]="col.getIsLoading ? col.getIsLoading(rowData) : false"
                styleClass="p-button-outlined"
                [style]="{ color: getStringOrFunctionResult(col.color, rowData) }"
                (click)="col.onClick(rowData)"></p-button>

              <ng-container *ngIf="col.tag === 'p-splitButton'">
                <ng-container *ngIf="rowData.organization.is_quickbooks_connected; else showSplitButton">
                  <div style="display: flex; justify-content: center; color: green;">
                    <i class="pi pi-check"></i>
                  </div>
                </ng-container>

                <ng-template #showSplitButton>
                  <p-splitButton
                    label="Xero"
                    styleClass="p-button-outlined"
                    appendTo="body"
                    [model]="getMenuItems(col.items, rowData)"
                    (onClick)="ledgerAction.emit({ rowData: rowData, ledgerId: 2 })"></p-splitButton>
                </ng-template>
              </ng-container>

              <p-checkbox
                *ngIf="col.tag === 'p-checkbox'"
                [value]="col.getValue(rowData, i)"
                [binary]="true"
                (onChange)="col.setValue(rowData, $event.checked)"></p-checkbox>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </ng-template>
  `,
})
export class TableComponent {
  protected selectedProducts: any[];
  @Input() columns: {
    field?: string;
    header: string;
    styleClass?: string;
    tag?: string;
    label?: string | ((rowData: any) => string);
    icon?: string | ((rowData: any) => string);
    color?: string | ((rowData: any) => string);
    getIsLoading?: (rowData: any) => boolean;
    getValue?: (rowData: any, index: number) => string;
    setValue?: (rowData: any, newValue: any) => void;
  }[];
  @Input() loading?: boolean;
  @Input() value: any[];
  @Input() defaultSortField?: string;
  @Input() defaultSortOrder?: number = 1;
  @Input() showCheckbox?: boolean = false;
  @Output() ledgerAction = new EventEmitter<{ rowData: any; ledgerId: number }>();

  ngOnInit() {}

  protected getStringOrFunctionResult(prop: string | ((rowData: any) => string), rowData) {
    if (!prop) return prop;
    return typeof prop === 'string' ? prop : prop(rowData);
  }

  protected getMenuItems(items: any[], rowData: any) {
    if (!rowData['_menuItems']) {
      rowData['_menuItems'] = items.map((item) => ({
        label: item.label,
        icon: item.icon,
        command: () => {
          this.ledgerAction.emit({
            rowData: rowData,
            ledgerId: item.ledgerId,
          });
        },
      }));
    }
    return rowData['_menuItems'];
  }
}
