/** Dependencies */
import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core'
import Plotly from 'plotly.js-dist-min'

/** Types */
type PlotlyChartData = {
  type: string,
  data: [number, number | null][],
  legend?: string,
  unit?: string,
  style?: Record<string, any>
}

/** Component */
@Component({
  selector: 'app-plotly-chart',
  imports: [],
  templateUrl: './plotly-chart.component.html',
  styleUrl: './plotly-chart.component.scss'
})
export class PlotlyChartComponent {
  public id = input<string>('plotly-chart');
  public xLabel = input<string>('TEXT');
  public yLabel = input<string>('TEXT');
  public xRange = input<any[]>([]);
  public yRange = input<any[]>([]);
  public data = input<PlotlyChartData[]>([]);

  public onCustomButtonClick = output<any>();

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

  private _parseData(serie: PlotlyChartData): Partial<Plotly.Data> {
    return {
      x: serie.data.map((v: [number, number | null]) => v[0]),
      y: serie.data.map((v: [number, number | null]) => v[1])
    };
  }

  private _normalizeData(serie: PlotlyChartData): Partial<Plotly.Data> {
    return {
      x: serie.data.map((v: [number, number | null]) => v[0]),
      y: serie.data.map(() => -10),
    }
  }

  private _fillGapData(data: [number, number][]): [number, number | null][] {
    if (data.length < 2) return data;

    let minGap = data[1][0] - data[0][1];

    for (let i = 1; i < data.length - 2; i++) {
      const gap = data[i + 1][0] - data[i][0];
      if (gap < minGap) minGap = gap;
    }

    const newData: [number, number | null][] = [];

    for (let i = 0; i < data.length - 2; i++) {
      const element = data[i];
      newData.push(element);
      let time = element[0];
      const nextElement = data[i + 1];
      const nextTime = nextElement[0];

      while ((time + minGap * 1.2) < nextTime) {
        newData.push([time + minGap, null]);
        time = time + minGap;
      }
    }

    newData.push(data[data.length - 1]);

    return newData;
  }

  private _drawChart(data: PlotlyChartData[]): void {
    const traces: Plotly.Data[] = this._getTraces(data);
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

  private _getTraces(data: PlotlyChartData[]): Plotly.Data[] {
    return data.map((serie: PlotlyChartData) => {

      const trace: Plotly.Data = {
        ...(serie.type === 'scatter' && serie.style && serie.style['marker']) ?
          this._normalizeData({ ...serie, data: this._decimateData(serie.data, 30) }) :
          // this._parseData({ ...serie, data: this._fillGapData(serie.data as [number, number][]) }),
          this._parseData({ ...serie, data: serie.data }),
        type: serie.type,
        name: serie.legend ?? undefined,
      } as Plotly.Data;

      if (serie.type === 'scatter' && serie.style && serie.style['color']) {
        (trace as Plotly.ScatterData).mode = 'lines';
        (trace as Plotly.ScatterData).line = {
          color: serie.style['color']
        }
      }

      if (serie.type === 'bar' && serie.style && serie.style['color']) {
        (trace as Plotly.PlotData).marker = { color: serie.style['color'] };
      }

      if (serie.type === 'scatter' && serie.style && serie.style['marker']) {
        (trace as Plotly.ScatterData).mode = 'markers';
        (trace as Plotly.ScatterData).marker = {
          symbol: serie.style['marker'] ?? undefined,
          size: 12,
          angle: serie.data.map((d: [number, number | null]) => d[1]),
          color: 'black'
        } as any
      }

      return {
        ...trace,
        connectgaps: false,
        hovertemplate: `%{x}<br>${serie.legend}: %{y} ${serie.unit}<extra></extra>`
      };
    });
  }

  private _getLayout(): Partial<Plotly.Layout> {
    return {
      showlegend: true,
      legend: {
        x: 1,
        y: 1,
        xanchor: 'right',
        bgcolor: 'transparent'
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
        nticks: 20,
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
        nticks: 20,
        // type: this._dateAxis === 'x' ? 'date' : '-',
        type: 'date',
        // tickformat: this._dateAxis === 'x' ? '%Y-%m-%d h:%H:%M' : undefined,
        // tickformat: '%Y-%m-%d h:%H:%M',
        tickformat: undefined,
        automargin: true,
        tickformatstops: [
          {
            dtickrange: ["M1", "M1"],
            value: "%d %b"
          }
        ]
      },
      hoverlabel: {
        bgcolor: 'white',
        font: {
          color: 'black'
        }
      },
      shapes: [
        // ...this._createHorizontalBands(),
        {
          type: 'rect',
          xref: 'paper',
          yref: 'y',
          x0: 0,
          x1: 1,
          y0: this.yRange().length >= 2 ? this.yRange()[1] : undefined,
          y1: this.yRange().length >= 2 ? this.yRange()[1] + 1 : undefined,
          fillcolor: 'rgba(255, 0, 0, 0.2)',
          line: { width: 0 }
        }

      ]
    }
  }

  private _createHorizontalBands(): Partial<Plotly.Shape>[] {
    const min = -this.yRange()[1];
    const max = this.yRange()[1];
    const step = (max - min) / 40;

    let flip = false;
    const horizontalBands: Partial<Plotly.Shape>[] = [];

    for (let y = min; y < max; y += step) {
      if (flip) {
        horizontalBands.push({
          type: "rect",
          x0: 0,
          x1: 1,
          y0: y,
          y1: y + step,
          xref: "paper",
          yref: "y",
          fillcolor: "#EEEEFF",
          line: { width: 0 },
          layer: "below"
        });
      }
      flip = !flip;
    }

    return horizontalBands;
  }

  private _getConfig(): Partial<Plotly.Config> {
    return {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToAdd: [
        {
          title: 'Download plot as csv',
          name: 'csv_download',
          icon: {
            width: 960,
            height: 960,
            path: 'm480 624-192-192 51-51 105 105v-342h72v342l105-105 51 51-192 192zm-216.28 144q-29.72 0-50.72-21.15t-21-50.85v-72h72v72h432v-72h72v72q0 29.7-21.16 50.85-21.16 21.15-50.88 21.15h-432.24z'
          },
          click: () => this.onCustomButtonClick.emit(this.data())
        }
      ]
    }
  }

  private _shouldResize(): boolean {
    const plotDiv = this.plotly.nativeElement as any;
    if (!plotDiv || !plotDiv._fullLayout) return false;

    const rect: DOMRect = this.plotly.nativeElement.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private _decimateData<T>(data: T[], maxPoints: number): T[] {
    if (data.length <= maxPoints) return data;
    const ratio = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % ratio === 0);
  }
}