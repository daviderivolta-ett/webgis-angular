import { SensorType } from '../station'

export class MapChart {
    public id: string;
    public data: [number, number][][];
    public sensors: SensorType[];

    constructor(data: [number, number][][], sensors: SensorType[], id?: string) {
        this.id = id ?? `${new Date().getTime() + Math.random().toString(36).substring(2, 10)}`;
        this.data = data;
        this.sensors = sensors;
    }
}