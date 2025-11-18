import { SensorType } from '../station'
import { MapChartData } from './map-chart-data.class'

export class MapChart {
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