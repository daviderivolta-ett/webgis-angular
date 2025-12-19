/** Dependencies */
import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core'
import Plotly from 'plotly.js-dist-min'

/** Types */
type PlotlyChartData = {
  type: string,
  data: [number, number | null][],
  legend?: string,
  unit?: string,
  style?: Record<string, any>,
  yLabel?: string;
  yUnit?: string;
  yRange?: any[];
  needsAdditionalYAxis?: boolean;
  isMainYAxis?: boolean;
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
  public xRange = input<any[]>([]);
  public data = input<PlotlyChartData[]>([]);
  public referenceDate = input<Date | undefined>(new Date());

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
      y: serie.data.map((v: [number, number | null]) => v[1]),
      hovertemplate: `%{x}<br>${serie.legend}: %{y} ${serie.unit}<extra></extra>`
    };
  }

  private _normalizeData(serie: PlotlyChartData): Partial<Plotly.Data> {
    return {
      x: serie.data.map((v: [number, number | null]) => v[0]),
      y: serie.data.map(() => -10),
      text: serie.data.map((v: [number, number | null]) => v[1] !== null && v[1] !== undefined ? String(v[1]) : ''),
      hoverinfo: 'x+text'
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
    const layout: Plotly.Layout = this._getLayout(data) as Plotly.Layout;
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
    let additionalYAxisCounter: number = 2;

    return data.map((serie: PlotlyChartData, i: number) => {
      let yaxisName: string;

      if (serie.needsAdditionalYAxis) {
        yaxisName = `y${additionalYAxisCounter}`;
        additionalYAxisCounter++;
      } else {
        yaxisName = 'y';
      }

      const trace: Plotly.Data = {
        ...(serie.type === 'scatter' && serie.style && serie.style['marker']) ?
          this._normalizeData({ ...serie, data: this._decimateData(serie.data, 30) }) :
          this._parseData({ ...serie, data: this._fillGapData(serie.data as [number, number][]) }),
        type: serie.type,
        name: serie.legend ?? undefined,
        yaxis: yaxisName
      } as Plotly.Data;

      if (serie.type === 'scatter' && serie.style && serie.style['color']) {
        (trace as Plotly.ScatterData).mode = 'lines';
        (trace as Plotly.ScatterData).line = {
          color: serie.style['color'],
          width: 1
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
        connectgaps: false
      };
    });
  }

  private _getLayout(data: PlotlyChartData[]): Partial<Plotly.Layout> {
    let layout: Partial<Plotly.Layout> = {
      showlegend: true,
      hovermode: 'x unified',
      legend: {
        x: 0,
        y: 1,
        xanchor: 'left',
        bgcolor: 'transparent'
      },
      margin: {
        t: 56
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
        type: 'date',
        ticklabelmode: 'instant',
        showgrid: true,
        gridwidth: 1,
        automargin: true,
        tickformatstops: [
          {
            dtickrange: [null, "D1"],
            value: "%H:%M"
          },
          {
            dtickrange: ["D1", "M1"],
            value: "%d/%m"
          },
          {
            dtickrange: ["M1", null],
            value: "%b %Y"
          }
        ]
      },
      hoverlabel: {
        bgcolor: 'white',
        font: {
          color: 'black'
        }
      },
      shapes: []
    };

    const lastDateShape: Partial<Plotly.Shape> | undefined = this._createShapeForLastDateValue(data);
    if (lastDateShape) layout.shapes?.push(lastDateShape);

    let additionalYAxisCounter: number = 2;

    const mainYAxis: PlotlyChartData | undefined = data.find((d: PlotlyChartData) => d.isMainYAxis);

    data.forEach((d: PlotlyChartData, i: number) => {
      let axisName: string;
      let axisShortName: string;

      if (d.needsAdditionalYAxis) {
        axisName = `yaxis${additionalYAxisCounter}`;
        axisShortName = `y${additionalYAxisCounter}`
        additionalYAxisCounter++;
      } else {
        axisName = 'yaxis';
        axisShortName = 'y';
      }

      (layout as any)[axisName] = {
        title: {
          text: !mainYAxis ?
            ((d.yLabel && d.unit) ? `${d.yLabel} (${d.unit})` : undefined) :
            (mainYAxis.yLabel && mainYAxis.unit) ? `${mainYAxis.yLabel} (${mainYAxis.unit})` : undefined
          ,
          font: {
            size: 10,
            weight: 400,
            color: '#b0b0b0'
          },
          standoff: 10
        },
        range: d.unit && d.unit !== '°' ? d.yRange : undefined,
        nticks: 20,
        tickformat: undefined,
        overlaying: d.needsAdditionalYAxis ? 'y' : undefined,
        side: d.needsAdditionalYAxis ? 'right' : 'left',
        showgrid: axisName === 'yaxis' ? true : false
      }

      // if (d.unit !== '°') {
      //   layout.shapes?.push({
      //     type: 'line',
      //     xref: 'paper',
      //     x0: 0,
      //     x1: 1,
      //     yref: axisShortName as any,
      //     y0: (d.yRange && d.yRange.length >= 2) ? d.yRange[1] : undefined,
      //     y1: (d.yRange && d.yRange.length >= 2) ? d.yRange[1] : undefined,
      //     line: {
      //       color: 'rgba(255, 0, 0, .2)',
      //       width: 4
      //     }
      //   });
      // }
    });

    return layout;
  }

  // private _createHorizontalBands(): Partial<Plotly.Shape>[] {
  //   const min = -this.yRange()[1];
  //   const max = this.yRange()[1];
  //   const step = (max - min) / 40;

  //   let flip = false;
  //   const horizontalBands: Partial<Plotly.Shape>[] = [];

  //   for (let y = min; y < max; y += step) {
  //     if (flip) {
  //       horizontalBands.push({
  //         type: "rect",
  //         x0: 0,
  //         x1: 1,
  //         y0: y,
  //         y1: y + step,
  //         xref: "paper",
  //         yref: "y",
  //         fillcolor: "#EEEEFF",
  //         line: { width: 0 },
  //         layer: "below"
  //       });
  //     }
  //     flip = !flip;
  //   }

  //   return horizontalBands;
  // }

  private _getConfig(): Partial<Plotly.Config> {
    return {
      responsive: true,
      displaylogo: false,
      showAxisDragHandles: false,
      modeBarButtonsToRemove: [
        'toImage',
        'autoScale2d'
      ],
      modeBarButtonsToAdd: [
        {
          title: 'Download plot as png',
          name: 'png_download',
          icon: {
            width: 960,
            height: 960,
            path: 'M 480 384 h 296 q -22 -66 -70.5 -116.5 T 592 191 L 480 384 Z m -83 48 l 148 -256 q -17 -2 -33 -5 t -32 -3 q -54 0 -103.5 18.5 T 285 237 l 112 195 Z m -225 96 h 225 L 249 271 q -40 43 -60.5 97 T 168 480 q 0 13 1 25 t 3 23 Z m 196 241 l 112 -193 H 184 q 23 66 70 117 t 114 76 Z m 112 23 q 53 0 102.5 -18 t 92.5 -51 L 563 528 L 415 784 q 16 2 32 5 t 33 3 Z m 231 -103 q 38 -43 59.5 -96.5 T 792 480 q 0 -12 -1 -24 t -3 -24 H 563 l 148 257 Z M 480 480 Z m 0 384 q -80 0 -150 -30 t -122 -82 q -52 -52 -82 -122 T 96 480 q 0 -80 30 -149.5 t 82 -122 Q 260 156 330 126 t 150 -30 q 80 0 149.5 30 t 122 82.5 Q 804 261 834 330.5 T 864 480 q 0 80 -30 150 t -82.5 122 q -52.5 52 -122 82 T 480 864 Z'
          },
          click: (gd) => Plotly.toImage(gd, { format: 'png', height: (gd as any)._fullLayout.height, width: (gd as any)._fullLayout.width }).then((url) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plot.png';
            a.click();
          })
        },
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

  private _createShapeForLastDateValue(data: PlotlyChartData[]): Partial<Plotly.Shape> | undefined {
    if (data.length === 0) return undefined;

    const lastXValue: number = Math.max(
      ...data.flatMap((v: PlotlyChartData) => v.data.map((d: [number, number | null]) => d[0]).filter(date => !isNaN(date) && date !== null))
    );

    return {
      type: 'rect',
      yref: 'paper',
      y0: 0,
      y1: 1,
      xref: 'x',
      x0: lastXValue,
      x1: this.referenceDate()?.getTime() ?? new Date().getTime(),
      fillcolor: 'rgba(255, 252, 127, .5)',
      line: { width: 0 },
      layer: 'below'
    }
  }
}