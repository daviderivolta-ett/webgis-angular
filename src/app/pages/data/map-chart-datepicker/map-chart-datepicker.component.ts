/** Dependencies */
import { Component, effect, model, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Component */
@Component({
  selector: 'app-map-chart-datepicker',
  imports: [ReactiveFormsModule],
  templateUrl: './map-chart-datepicker.component.html',
  styleUrl: './map-chart-datepicker.component.scss'
})
export class MapChartDatepickerComponent {
  public endingDate = model<Date>(new Date());
  public initialDate = model<Date>(this._getInitialDateFrom(this.endingDate()));
  public form = new FormGroup({
    initialDate: new FormControl(this._formatDate(this.initialDate())),
    endingDate: new FormControl(this._formatDate(this.endingDate()))
  });
  public datesChanged = output<[string, string]>();

  constructor() {
    this.form.valueChanges.subscribe((changes) => this._onFormChange(changes));

    effect(() => {
      this.form.patchValue({ initialDate: this._formatDate(this.initialDate()), endingDate: this._formatDate(this.endingDate()) });
    });
  }

  /** Methods */
  private _onFormChange(changes: any) {
    const initialDate = changes['initialDate'];
    const endingDate = changes['endingDate'];  
    if (initialDate && endingDate) this.datesChanged.emit([initialDate, endingDate]);
  }

  private _getInitialDateFrom(date: Date): Date {
    const initialDate = new Date(date);
    initialDate.setDate(date.getDate() - 15);
    return initialDate;
  }

  private _formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
