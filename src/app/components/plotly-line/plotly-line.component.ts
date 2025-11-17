/** Dependencies */
import { Component, effect, ElementRef, input, ViewChild } from '@angular/core';
import Plotly from 'plotly.js-dist-min';

/** Component */
@Component({
  selector: 'app-plotly-line',
  imports: [],
  templateUrl: './plotly-line.component.html',
  styleUrl: './plotly-line.component.scss'
})
export class PlotlyLineComponent {
  public id = input<string>('plotly-line');
  public xLabel = input<string>('TEXT');
  public yLabel = input<string>('TEXT');
  public xRange = input<any[]>([]);
  public yRange = input<any[]>([]);
  public data = input<[number, number][][]>([]);
  public legends = input<string[]>([]);
  public styles = input<Record<string, any>[]>([]);
  public parsedData: Partial<Plotly.Data>[] = [];

  @ViewChild('plotly') plotly!: ElementRef<HTMLDivElement>;

  private _resizeObserver: ResizeObserver;

  constructor() {
    this._resizeObserver = new ResizeObserver(() => {
      if (this._shouldResize()) Plotly.Plots.resize(this.plotly.nativeElement);
    });

    effect(() => this._drawChart(this.data()));
  }

  /** Component lifecycle */
  public ngAfterViewInit(): void {
    this._drawChart(this.data());
  }

  public ngOnDestroy(): void {
    this._resizeObserver.disconnect();
  }

  /** Methods */
  private _setup(): void {
    this._resizeObserver.observe(this.plotly.nativeElement);
  }

  private _parseData(data: [number, number][][]): Partial<Plotly.Data>[] {
    return data.map((series: [number, number][]) => ({
      x: series.map((v: [number, number]) => v[0]),
      y: series.map((v: [number, number]) => v[1])
    }))
  }

  private _drawChart(data: [number, number][][]): void {
    const parsedData = this._parseData(data);

    const traces: Plotly.Data[] = this._getTraces(parsedData, this.legends(), this.styles());
    const layout: Plotly.Layout = this._getLayout() as Plotly.Layout;
    const config: Plotly.Config = this._getConfig() as Plotly.Config;

    if (!this.plotly) return;

    Plotly.newPlot(
      this.id(),
      traces,
      layout,
      config
    )
      .then(() => this._setup())
  }

  private _getTraces(data: Partial<Plotly.Data>[], legends: string[], styles: Record<string, any>[]): Plotly.Data[] {
    return data.map((serie: Partial<Plotly.Data>, i: number) => {
      return {
        ...serie,
        mode: 'lines',
        name: legends[i] ?? undefined,
        line: {
          color: (styles[i] && styles[i]['color']) ?? undefined
        }
      } as Plotly.Data
    })
  }

  private _getLayout(): Partial<Plotly.Layout> {
    return {
      showlegend: true,
      legend: {
        x: 1,
        y: 1,
        xanchor: 'right'
      },
      margin: {
        t: 56
      },
      yaxis: {
        title: {
          // text: this._yUnit,
          text: this.yLabel(),
          font: {
            size: 10,
            weight: 400,
            color: '#b0b0b0'
          },
          standoff: 10
        },
        range: this.yRange().length > 0 ? this.yRange() : undefined,
        // type: this._dateAxis === 'y' ? 'date' : '-',
        type: '-',
        // tickformat: this._dateAxis === 'y' ? '%Y-%m-%d, %H:%M' : undefined,
        tickformat: undefined,
        automargin: true
      },
      xaxis: {
        title: {
          // text: this._xUnit,
          text: this.xLabel(),
          font: {
            size: 10,
            weight: 400,
            color: '#b0b0b0'
          }
        },
        range: this.xRange().length > 0 ? this.xRange() : undefined,
        // type: this._dateAxis === 'x' ? 'date' : '-',
        type: 'date',
        // tickformat: this._dateAxis === 'x' ? '%Y-%m-%d h:%H:%M' : undefined,
        tickformat: '%Y-%m-%d h:%H:%M',
        automargin: true
      }
    }
  }

  private _getConfig(): Partial<Plotly.Config> {
    return {
      responsive: true,
      displaylogo: false
    }
  }

  private _shouldResize(): boolean {
    const plotDiv = this.plotly.nativeElement as any;
    if (!plotDiv || !plotDiv._fullLayout) return false;

    const rect: DOMRect = this.plotly.nativeElement.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
}