import { Component, Input, OnInit, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
//import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-datepicker-component',
  template: `
    <!-- Date picker starts -->
    <input
      (change)="selectionChanged()"
      (dateSelect)="selectionChanged()"
      [(ngModel)]="dateValue"
      [ngClass]="{ 'is-invalid': addInvalidCssClass, mandatory: mandatory }"
      class="form-control "
      id="{{ inputId }}"
      name="app-datepicker-component"
      placeholder="yyyy-mm-dd"
      ngbDatepicker />
    <div role="button" tabindex="0" class="input-group-addon">
      <i class="link-icon pi pi-calendar"></i>
    </div>
    <!-- Date picker ends -->
  `,
  styles: [],
})
export class DatePickerComponent implements OnInit, OnChanges {
  public dateValue: any; //NgbDateStruct;

  //
  // The ID of the <input>, this is sometimes needed because the UI tests need to interact with the underlying
  // html element.
  //
  @Input()
  inputId: string;

  @Input()
  mandatory = false;

  @Input()
  addInvalidCssClass = false;

  @Input()
  selectedModel: string;

  @Output()
  selectedModelChange = new EventEmitter<string>();

  public ngOnInit() {}

  public ngOnChanges(changes: SimpleChanges) {}

  public selectionChanged() {}

  /*
  public constructor(private calendar: NgbCalendar) {
    this.dateValue = calendar.getToday();
  }

  public ngOnInit() {
    this.processInput();
    if (this.inputId === undefined) {
      this.inputId = 'app-datepicker-component';
    }
  }

  //
  // This is triggered if the parent component updates the input.
  //
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedModel) {
      this.processInput();
    }
  }

  private processInput() {
    this.dateValue = this.fromIsoStringToNgbDateStruct(this.selectedModel);
  }

  //
  // The selection has changed either by selecting from the datepicker popup or by loosing focus
  // of the input after a changed was entered using the keyboard.
  //
  public selectionChanged() {
    // Turn the "native" value from a NgbDateStruct to the ISO string date and emit the change.
    const isoDate = this.fromNgbDateStructToIsoString(this.dateValue);
    this.selectedModel = isoDate;
    this.selectedModelChange.emit(this.selectedModel);
  }

  private fromNgbDateStructToIsoString(unparsedDate: any) {
    try {
      if (typeof unparsedDate === 'string' && String(unparsedDate).indexOf('/') > 0) {
        return new Date(Date.parse(unparsedDate)).toISOString();
      } else {
        return new Date(unparsedDate.year, unparsedDate.month - 1, unparsedDate.day).toISOString();
      }
    } catch (e) {
      // Date is invalid
      console.warn(e);
      return undefined;
    }
  }

  private fromIsoStringToNgbDateStruct(date: string): NgbDateStruct {
    if (!date) {
      return null;
    }
    const dateObject = new Date(date);
    return {
      day: dateObject.getDate(),
      month: dateObject.getMonth() + 1,
      year: dateObject.getFullYear(),
    };
  }
    */
}
