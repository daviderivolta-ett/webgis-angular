/** Dependencies */
import { Component, effect, ElementRef, input, ViewChild } from '@angular/core'
import Plotly from 'plotly.js-dist-min'

/** Types */
type PlotlyChartData = {
  type: string,
  data: [number, number][],
  legend?: string,
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
      x: serie.data.map((v: [number, number]) => v[0]),
      y: serie.data.map((v: [number, number]) => v[1])
    };
  }

  private _normalizeData(serie: PlotlyChartData): Partial<Plotly.Data> {
    return {
      x: serie.data.map((v: [number, number]) => v[0]),
      y: serie.data.map(() => 1),
    }
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
        ...(serie.type === 'scatter' && serie.style && serie.style['marker']) ? this._normalizeData({ ...serie, data: this._decimateData(serie.data, 30) }) : this._parseData(serie),
        type: serie.type,
        name: serie.legend ?? undefined,
      } as Plotly.Data;

      if (serie.type === 'scatter' && serie.style && serie.style['color']) {
        (trace as Plotly.ScatterData).mode = 'lines';
        (trace as Plotly.ScatterData).line = {
          color: serie.style['color']
        }
      }

      if (serie.type === 'scatter' && serie.style && serie.style['marker']) {
        (trace as Plotly.ScatterData).mode = 'markers';
        (trace as Plotly.ScatterData).marker = {
          symbol: serie.style['marker'] ?? undefined,
          size: 12,
          angle: serie.data.map((d: [number, number]) => d[1]),
          color: 'blue'
        } as any
      }

      return trace;
    });
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
      },
      shapes: [
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

  private _decimateData<T>(data: T[], maxPoints: number): T[] {
    if (data.length <= maxPoints) return data;
    const ratio = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % ratio === 0);
  }
}