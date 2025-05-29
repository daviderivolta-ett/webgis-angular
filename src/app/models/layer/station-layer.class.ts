import { Layer } from './layer.class';

export class StationLayer extends Layer {
    public endpoint: string;
    public iconUrl?: string;

    constructor(id: string, endpoint: string, iconUrl?: string, label?: string) {
        super(id, label);
        this.endpoint = endpoint;
        this.iconUrl = iconUrl;
    }

    static isStationLayer(object: any): object is StationLayer {
        return (
            object &&
            typeof object === 'object' &&
            typeof object.id === 'string' &&
            typeof object.endpoint === 'string'
        );
    }
}