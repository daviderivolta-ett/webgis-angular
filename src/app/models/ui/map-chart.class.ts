import { SensorType } from '../station'

export class MapChart {
    public id: string;
    public parameter: string;
    public data: [number, number][][];
    public sensors: SensorType[];

    constructor(parameter: string, data: [number, number][][], sensors: SensorType[], id?: string) {
        this.id = id ?? `${new Date().getTime() + Math.random().toString(36).substring(2, 10)}`;
        this.parameter = parameter;
        this.data = data;
        this.sensors = sensors;
    }
}