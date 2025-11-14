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
        yRange?: any[]
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
        this.yRange =yRange;
    }
}