/** Dependencies */
import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core'
import Plotly from 'plotly.js-dist-min'
// @ts-ignore
import itLocale from 'plotly.js-locales/it'

/** Types */
type PlotlyChartData = {
  sensor: string,
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
  isCumulated?: boolean;
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
  public thresholds = input<Record<string, number>>({});
  public referenceDate = input<Date | undefined>(new Date());

  public onCustomButtonClick = output<any>();

  @ViewChild('plotly') plotly!: ElementRef<HTMLDivElement>;

  private _resizeObserver: ResizeObserver;

  constructor() {
    Plotly.register(itLocale);

    this._resizeObserver = new ResizeObserver(() => {
      if (this._shouldResize()) Plotly.Plots.resize(this.plotly.nativeElement);
    });

    effect(() => this._drawChart(this.data()));
    effect(() => this._drawThresholds(this.thresholds()));
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
      hovertemplate: `%{y} ${serie.unit}<extra></extra>`
    };
  }

  private _normalizeData(serie: PlotlyChartData): Partial<Plotly.Data> {
    return {
      x: serie.data.map((v: [number, number | null]) => v[0]),
      y: serie.data.map(() => -10),
      text: serie.data.map((v: [number, number | null]) => v[1] !== null && v[1] !== undefined ? `${String(v[1])} ${serie.unit}` : ''),
      hoverinfo: 'text'
    }
  }

  private _fillGapData(data: [number, number][]): [number, number | null][] {
    if (data.length < 2) return data;

    let minGap = data[1][0] - data[0][0];

    for (let i = 1; i < data.length - 2; i++) {
      const gap = data[i + 1][0] - data[i][0];
      if (gap < minGap) minGap = gap;
    }

    const newData: [number, number | null][] = [];

    for (let i = 0; i <= data.length - 2; i++) {
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
    if (this.plotly) Plotly.purge(this.id());
    
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
      .then((chart: Plotly.PlotlyHTMLElement) => {
        chart.on('plotly_relayout', (e: Plotly.PlotRelayoutEvent) => this._onChartRelayout(e, data, traces, layout, config));
        this._drawThresholds(this.thresholds());
        this._setup();
      })
  }

  private _getTraces(data: PlotlyChartData[]): Plotly.Data[] {
    let additionalYAxisCounter: number = 2;

    return data.map((serie: PlotlyChartData) => {
      let yaxisName: string;

      if (serie.needsAdditionalYAxis) {
        yaxisName = `y${additionalYAxisCounter}`;
        additionalYAxisCounter++;
      } else {
        yaxisName = 'y';
      }

      const trace: Plotly.Data = {
        ...(serie.type === 'scatter' && serie.style && serie.style['marker']) ?
          this._normalizeData({ ...serie, data: this._decimateData(serie.data, 20) }) :
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
        (trace as Plotly.PlotData).marker = {
          color: serie.style['color']
        };
      }

      if (serie.type === 'scatter' && serie.style && serie.style['marker']) {
        (trace as Plotly.ScatterData).mode = 'markers';
        (trace as Plotly.ScatterData).marker = {
          size: 12,
          color: 'transparent'
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
      bargap: 4,
      hovermode: 'x unified',
      legend: {
        orientation: 'h',
        x: .5,
        xanchor: 'center',
        y: -.15,
        yanchor: 'top'
      },
      margin: {
        t: 56,
        l: 40,
        r: 40
      },
      xaxis: {
        title: {
          text: this.xLabel(),
          font: {
            size: 10,
            weight: 400,
            color: '#b0b0b0'
          },
        },
        range: this.xRange().length > 0 ?
          this.xRange() :
          undefined,
        rangeselector: {
          bordercolor: '#ddd',
          bgcolor: '#fff',
          activecolor: '#eeeeff',
          borderwidth: 1,
          buttons: [
            {
              step: 'hour',
              stepmode: 'backward',
              count: 24,
              label: '24h'
            },
            {
              step: 'hour',
              stepmode: 'backward',
              count: 48,
              label: '48h'
            },
            {
              step: 'day',
              stepmode: 'backward',
              count: 7,
              label: '7gg'
            },
            {
              step: 'day',
              stepmode: 'backward',
              count: 15,
              label: '15gg'
            },
            {
              step: 'day',
              stepmode: 'backward',
              count: 30,
              label: '30gg'
            },
            {
              step: 'all',
              label: 'Totale'
            },
          ]
        },
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
        bgcolor: '#ffffffbf',
        font: {
          color: 'black'
        }
      },
      shapes: []
    };

    const lastDateShape: Partial<Plotly.Shape> | undefined = this._createShapeForLastDateValue(data);
    if (lastDateShape) layout.shapes?.push(lastDateShape);

    const range: [number, number] | undefined = this._getDateRange(data);
    if (range && layout.xaxis) layout.xaxis.range = [range[0], range[1] + 3 * 60 * 60 * 1000];

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

      const maxYValue: number = Math.max(...d.data.map((v: any) => v[1]));     

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
        range: (d.unit && d.unit !== '°') ?
          ((d.yRange && maxYValue > d.yRange[1]) ? [d.yRange[0], maxYValue] : d.yRange) :
          undefined,
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

      if (d.type === 'scatter' && d.style && d.style['marker']) {
        const xMin = d.data[0];
        const xMax = d.data[d.data.length - 1];
        if (typeof xMin[0] === 'number' && typeof xMax[0] === 'number') layout.annotations = this._createFakeMarkersAsAnnotations(data, d, xMin[0], xMax[0]);
      }
    });

    return layout;
  }

  private _drawThresholds(thresholds: Record<string, number>): void { 
    if (!this.plotly) return;

    const plotly = this.plotly.nativeElement as any;

    const shapes: Partial<Plotly.Shape>[] = Object.entries(thresholds)
      .filter((_, i) => i !== 0)
      .map(([color, value]: [string, number]) => {
        return {
          type: 'line',
          xref: 'paper',
          x0: 0,
          x1: 1,
          yref: 'y',
          y0: value,
          y1: value,
          line: {
            color,
            width: 1
          }
        }
      })

    Plotly.relayout(this.plotly.nativeElement, {
      shapes: [...plotly._fullLayout?.shapes, ...shapes]
    });
  }

  private _getConfig(): Partial<Plotly.Config> {
    return {
      locale: 'it',
      responsive: true,
      displaylogo: false,
      showAxisDragHandles: false,
      doubleClick: false,
      scrollZoom: true,
      modeBarButtonsToRemove: [
        'toImage',
        'autoScale2d',
        'zoomIn2d',
        'zoomOut2d'
      ],
      modeBarButtonsToAdd: [
        {
          title: 'Scarica il grafico come immagine PNG',
          name: 'png_download',
          icon: {
            width: 960,
            height: 960,
            path: 'M 480 384 h 296 q -22 -66 -70.5 -116.5 T 592 191 L 480 384 Z m -83 48 l 148 -256 q -17 -2 -33 -5 t -32 -3 q -54 0 -103.5 18.5 T 285 237 l 112 195 Z m -225 96 h 225 L 249 271 q -40 43 -60.5 97 T 168 480 q 0 13 1 25 t 3 23 Z m 196 241 l 112 -193 H 184 q 23 66 70 117 t 114 76 Z m 112 23 q 53 0 102.5 -18 t 92.5 -51 L 563 528 L 415 784 q 16 2 32 5 t 33 3 Z m 231 -103 q 38 -43 59.5 -96.5 T 792 480 q 0 -12 -1 -24 t -3 -24 H 563 l 148 257 Z M 480 480 Z m 0 384 q -80 0 -150 -30 t -122 -82 q -52 -52 -82 -122 T 96 480 q 0 -80 30 -149.5 t 82 -122 Q 260 156 330 126 t 150 -30 q 80 0 149.5 30 t 122 82.5 Q 804 261 834 330.5 T 864 480 q 0 80 -30 150 t -82.5 122 q -52.5 52 -122 82 T 480 864 Z'
          },
          click: (gd) => Plotly.toImage(gd, { format: 'png', height: (gd as any)._fullLayout.height, width: (gd as any)._fullLayout.width }).then((url) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `plot.png`;
            a.click();
          })
        },
        {
          title: 'Scarica il grafico come file CSV',
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

  private _onChartRelayout(event: Plotly.PlotRelayoutEvent, data: PlotlyChartData[], traces: Plotly.Data[], layout: Plotly.Layout, config: Plotly.Config): void {
    const xRange = this._getRelayoutXRange(event);
    if (!xRange) return;

    data.forEach((d: PlotlyChartData, i: number) => {
      /** Cumulated */
      if (d.isCumulated) {
        const newTraces: Plotly.Data[] | undefined = this._relayoutCumulatedValues(data, traces, i, xRange);
        Plotly.react(this.id(), newTraces ? [...newTraces] : [...traces], layout, config);
      }

      /** Arrows */
      if (d.type === 'scatter' && d.style && d.style['marker']) {
        const newTraces: Plotly.Data[] | undefined = this._relayoutMarkers(d, traces, i, xRange);
        const annotations = this._createFakeMarkersAsAnnotations(data, d, new Date(xRange[0]).getTime(), new Date(xRange[1]).getTime());
        Plotly.react(this.id(), newTraces ? [...newTraces] : [...traces], { ...layout, annotations }, config);
      }

    });
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

  private _relayoutCumulatedValues(data: PlotlyChartData[], traces: Plotly.Data[], traceIndex: number, xRange: [number, number]): Plotly.Data[] | undefined {
    const otherData: PlotlyChartData | undefined = data.find((d) => !d.isCumulated);
    if (!otherData) return;
    const cumulatedValues: [number, number][] = this._calculateCumulatedValue(otherData, new Date(xRange[0]).getTime(), new Date(xRange[1]).getTime());
    traces[traceIndex] = {
      ...traces[traceIndex],
      x: cumulatedValues.map(v => v[0]),
      y: cumulatedValues.map(v => v[1])
    } as Plotly.Data;
    return traces;
  }

  private _relayoutMarkers(serie: PlotlyChartData, traces: Plotly.Data[], traceIndex: number, xRange: [number, number]): Plotly.Data[] | undefined {
    const newValues = this._getVisileDataFromXRange(serie.data, new Date(xRange[0]).getTime(), new Date(xRange[1]).getTime());
    traces[traceIndex] = this._normalizeData({ ...serie, data: this._decimateData(newValues, 20) });

    if (serie.type === 'scatter' && serie.style?.['marker']) {
      const trace = traces[traceIndex] as Plotly.ScatterData;

      trace.name = serie.legend ?? '';
      trace.mode = 'markers';
      trace.marker = {
        size: 12,
        color: 'transparent'
      }
    }

    return traces;
  }

  private _calculateCumulatedValue(chartData: PlotlyChartData, xMin: number, xMax: number): [number, number][] {
    if (!chartData.data) return [];
    const values = this._getVisileDataFromXRange(chartData.data, xMin, xMax);
    const result: [number, number][] = [];
    let sum = 0;
    for (const [date, value] of values) {
      sum += value;
      result.push([date, sum]);
    }
    return result;
  }

  private _getRelayoutXRange(event: Plotly.PlotRelayoutEvent): [number, number] | undefined {
    const xRange = event['xaxis.range'] || [event['xaxis.range[0]'], event['xaxis.range[1]']];
    if (xRange.every((v) => v === undefined)) return undefined;

    const isXMinDate: boolean = Boolean(xRange[0] && typeof xRange[0] === 'string' && !isNaN(new Date(xRange[0]).getTime()));
    const isXMaxDate: boolean = Boolean(xRange[1] && typeof xRange[1] === 'string' && !isNaN(new Date(xRange[1]).getTime()));

    const xMin = isXMinDate ? new Date(xRange[0] as unknown as string).getTime() : undefined;
    const xMax = isXMaxDate ? new Date(xRange[1] as unknown as string).getTime() : undefined;

    return xMin && xMax ? [xMin, xMax] : undefined;
  }

  private _getVisileDataFromXRange(data: [number, number | null][], xMin: number, xMax: number): [number, number][] {
    return data.filter((point): point is [number, number] => point[0] >= xMin && point[0] <= xMax && point[1] !== null);
  }

  private _getDensityFromRange(range: number) {
    if (range < 10) return 100;
    if (range < 50) return 50;
    if (range < 200) return 20;
    return 20;
  }

  private _createFakeMarkersAsAnnotations(allData: PlotlyChartData[], chartData: PlotlyChartData, xMin: number, xMax: number): Partial<Plotly.Annotations>[] {
    const otherData: PlotlyChartData | undefined = allData.find((d) => d.sensor === chartData.style?.['markers']?.['relatedSensor']);

    if (!otherData) return [];

    const visibleData = this._getVisileDataFromXRange(chartData.data, xMin, xMax);
    const target = this._getDensityFromRange(xMax - xMin);
    const data = this._decimateData(visibleData, target);

    return data.map((p: [number, number | null]) => {
      const relatedData: [number, number | null] | undefined = otherData.data.find(([t, _]) => t === p[0]);

      return {
        x: p[0],
        y: -5,
        // text: chartData.style ? chartData.style['marker'] : '',
        text: relatedData && relatedData[1] && chartData.style ? this._getMarkerFromStyle(relatedData[1], chartData.style['markers']) : '',
        textangle: `${p[1] ?? 0}`,
        align: 'center',
        font: {
          size: 24
        },
        showarrow: false,
        arrowhead: 1,
        arrowsize: 2,
        arrowwidth: 1,
      };
    });
  }

  private _getMarkerFromStyle(value: number, markers: Record<string, any>): string {
    if (!('rules' in markers) && !(Array.isArray(markers['rules'])) && !('comparisonOperator' in markers['rules']) && !('threshold' in markers['rules']) && !('marker' in markers['rules'])) return '';

    for (const rule of markers['rules']) {
      switch (rule['comparisonOperator']) {
        case '<': if (value < rule['threshold']) return rule['marker']; break;
        case '<=': if (value <= rule['threshold']) return rule['marker']; break;
        case '>': if (value > rule['threshold']) return rule['marker']; break;
        case '>=': if (value >= rule['threshold']) return rule['marker']; break;
        case '===': if (value === rule['threshold']) return rule['marker']; break;
        case '!==': if (value !== rule['threshold']) return rule['marker']; break;
      }
    }
    return '';
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
      fillcolor: 'rgba(255, 252, 127, 1)',
      line: { width: 1, color: 'rgba(255, 252, 127, 1)' },
      layer: 'below'
    }
  }

  private _getDateRange(chartData: PlotlyChartData[]): [number, number] | undefined {
    const data = chartData
      .map(c => c.data)
      .map(v =>
        v.filter((p): p is [number, number] => p[1] !== null)
      );

    const flatData: [number, number][] = data.flat(1);
    const firstDate: number = Math.min(...flatData.map((c) => c[0]));
    const lastDate: number = Math.max(...flatData.map((c) => c[0]));
    return Number.isFinite(firstDate) && Number.isFinite(lastDate)
      ? [firstDate, lastDate]
      : undefined;
  }
}