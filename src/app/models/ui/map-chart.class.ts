import { SensorType } from '../station'

export class MapChart {
    public id: string;
    public type: 'line' | 'bar';
    public stationId: string;
    public station?: string;
    public parameter: string;
    public parameterLabel?: string;
    public xLabel?: string;
    public xUnit: string;
    public xRange?: any[];
    public yLabel?: string;
    public yUnit: string;
    public yRange?: any[];
    public styles?: Record<string, any>[];
    public data: [number, number][][];
    public legends?: string[];
    public sensors: SensorType[];

    constructor(
        type: 'line' | 'bar',
        stationId: string,
        parameter: string,
        xUnit: string,
        yUnit: string,
        data: [number, number][][],
        sensors: SensorType[],
        id?: string,
        station?: string,
        parameterlabel?: string,
        xLabel?: string,
        yLabel?: string,
        legends?: string[],
        xRange?: any[],
        yRange?: any[],
        styles?: Record<string, any>[]
    ) {
        this.id = id ?? `${new Date().getTime() + Math.random().toString(36).substring(2, 10)}`;
        this.type = type;
        this.stationId = stationId;
        this.parameter = parameter;
        this.xLabel = xLabel ?? '';
        this.xUnit = xUnit;
        this.yLabel = yLabel ?? '';
        this.yUnit = yUnit;
        this.data = data;
        this.sensors = sensors;
        this.station = station;
        this.parameterLabel = parameterlabel ?? parameter;
        this.legends = legends;
        this.xRange = xRange;
        this.yRange = yRange;
        this.styles = styles;
    }
}

/** */
export class MapChart2 {
    public id: string;
    public stationId: string;
    public data: MapChartData[];
    public currentParameter: string;
    public sensors: SensorType[];
    public stationName?: string;
    public currentParameterLabel?: string;
    public xLabel?: string;
    public xUnit?: string;
    public xRange?: any[];
    public yLabel?: string;
    public yUnit?: string;
    public yRange?: any[];

    constructor(
        stationId: string,
        data: MapChartData[],
        currentParameter: string,
        sensors: SensorType[],
        id?: string,
        stationName?: string,
        currentParameterLabel?: string,
        xLabel?: string,
        xUnit?: string,
        xRange?: any[],
        yLabel?: string,
        yUnit?: string,
        yRange?: any[]
    ) {
        this.id = id ?? `${new Date().getTime() + Math.random().toString(36).substring(2, 10)}`;
        this.stationId = stationId;
        this.data = data;
        this.currentParameter = currentParameter;
        this.sensors = sensors;
        this.stationName = stationName;
        this.currentParameterLabel = currentParameterLabel;
        this.xLabel = xLabel;
        this.xUnit = xUnit;
        this.xRange = xRange;
        this.yLabel = yLabel;
        this.yUnit = yUnit;
        this.yRange = yRange;
    }
}

export class MapChartData {
    public type: string;
    // public parameter: string;
    public data: [number, number][];
    public legend?: string;
    public style?: Record<string, any>;

    constructor(
        type: string,
        // parameter: string,
        data: [number, number][],
        legend?: string,
        style?: Record<string, any>
    ) {
        this.type = type;
        // this.parameter = parameter;
        this.data = data;
        this.legend = legend;
        this.style = style;
    }
}