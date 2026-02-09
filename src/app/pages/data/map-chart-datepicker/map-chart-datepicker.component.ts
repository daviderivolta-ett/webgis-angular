/** Dependencies */
import { Component, effect, input, model, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Component */
@Component({
  selector: 'app-map-chart-datepicker',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './map-chart-datepicker.component.html',
  styleUrl: './map-chart-datepicker.component.scss'
})
export class MapChartDatepickerComponent {
  public defaultGap = input<number>(30);
  public endingDate = model<Date | undefined>(new Date());
  public initialDate = model<Date>(this._getInitialDateFrom(this.endingDate() || new Date()));
  public form = new FormGroup({
    initialDate: new FormControl(this._formatDate(this.initialDate())),
    endingDate: new FormControl(this._formatDate(this.endingDate() || new Date()))
  });
  public datesChanged = output<[string, string]>();

  constructor() {
    this.form.valueChanges.subscribe((changes) => this._onFormChange(changes));

    effect(() => {    
      this.form.patchValue({ initialDate: this._formatDate(this._getInitialDateFrom(this.endingDate() || new Date())), endingDate: this._formatDate(this.endingDate() || new Date()) });
    });
  }

  /** Methods */
  private _onFormChange(changes: any) {
    const initialDate = changes['initialDate'];
    const endingDate = changes['endingDate'];
    setTimeout(() => {     
      if (initialDate && endingDate) this.datesChanged.emit([initialDate, endingDate]);
    });
  }

  private _getInitialDateFrom(date: Date): Date {
    const initialDate = new Date(date);
    initialDate.setDate(date.getDate() - this.defaultGap());
    return initialDate;
  }

  private _formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' +
      pad(date.getMonth() + 1) + '-' +
      pad(date.getDate()) + 'T' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes());
  }
}