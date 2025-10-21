import { SensorType } from '../station'

export class MapChart {
    public id: string;
    public stationId: string;
    public station?: string;
    public parameter: string;
    public parameterLabel?: string;
    public xLabel?: string;
    public xUnit: string;
    public yLabel?: string;
    public yUnit: string;
    public data: [number, number][][];
    public legends?: string[];
    public sensors: SensorType[];

    constructor(
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
        legends?: string[]
    ) {
        this.id = id ?? `${new Date().getTime() + Math.random().toString(36).substring(2, 10)}`;
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
    }
}









/** TEST */
export class MapChart2 {
    public id: string;
    public stationId: string;
    public parameter: string;
    public stationLabel?: string;
    public sensors: SensorType[];
    public datasets: ChartDataset[];

    constructor(
        stationId: string,
        parameter: string,
        sensors: SensorType[],
        datasets: ChartDataset[],
        id?: string,
        stationLabel?: string
    ) {
        this.id = id ?? `${new Date().getTime() + Math.random().toString(36).substring(2, 10)}`;
        this.stationId = stationId;
        this.parameter = parameter;
        this.stationLabel = stationLabel;
        this.sensors = sensors;
        this.datasets = datasets;
    }
}

export class ChartDataset {
    public parameter: string;
    public parameterLabel?: string;
    public xUnit: string;
    public xLabel?: string;
    public yUnit: string;
    public yLabel?: string;
    public legend?: string;
    public data: [number, number][];

    constructor(
        parameter: string,
        xUnit: string,
        yUnit: string,
        data: [number, number][],
        parameterLabel?: string,
        xLabel?: string,
        yLabel?: string,
        legend?: string
    ) {
        this.parameter = parameter;
        this.xUnit = xUnit;
        this.yUnit = yUnit;
        this.data = data;
        this.parameterLabel = parameterLabel;
        this.xLabel = xLabel;
        this.yLabel = yLabel;
        this.legend = legend;
    }
}
/** TEST */