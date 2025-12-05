/** Dependencies */
import { Component, ContentChild, effect, input, model, output } from '@angular/core';

/** Components */
import { PlotlyChartComponent } from '../../../components';
import { MapChartDatepickerComponent } from '../map-chart-datepicker/map-chart-datepicker.component';
import { MapChartSelectorComponent } from '../map-chart-selector/map-chart-selector.component';

/** Component */
@Component({
  selector: 'app-map-chart',
  imports: [],
  templateUrl: './map-chart.component.html',
  styleUrl: './map-chart.component.scss'
})
export class MapChartComponent {
  public header = input<string>('');
  public isLoading = input<boolean>(false);
  public param = model<string>('');
  public dates = model<[string, string]>([this._formatDate(this._getInitialDateFrom(new Date)), this._formatDate(new Date)]);

  public formValue: Record<string, any> = {
    param: this.param(),
    initialDate: this.dates()[0],
    endingDate: this.dates()[1]
  };
  public formChanged = output<Record<string, string>>();

  @ContentChild(MapChartDatepickerComponent) chartDatePicker?: MapChartDatepickerComponent;
  @ContentChild(MapChartSelectorComponent) chartSelector?: MapChartSelectorComponent;
  @ContentChild(PlotlyChartComponent) chart?: PlotlyChartComponent;

  constructor() {
    effect(() => this.formValue['param'] = this.param());
    effect(() => {
      this.formValue['initialDate'] = this.dates()[0];
      this.formValue['endingDate'] = this.dates()[1];
    })
  }

  /** Component lifecycles */
  public ngAfterContentInit(): void {
    if (this.chartSelector) {
      this.chartSelector.sensorTypeSelected.subscribe((param: string) => {
        this.param.set(param);
        this.formValue['param'] = param;
        this.formChanged.emit(this.formValue);
      });
    }

    if (this.chartDatePicker) {
      this.chartDatePicker.datesChanged.subscribe((dates: [string, string]) => {
        this.dates.set([dates[0], dates[1]]);
        this.formValue['initialDate'] = dates[0];
        this.formValue['endingDate'] = dates[1];
        this.formChanged.emit(this.formValue);
      });
    }
  }

  /** Methods */
  private _getInitialDateFrom(date: Date): Date {
    const initialDate = new Date(date);
    initialDate.setDate(date.getDate() - 15);
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
