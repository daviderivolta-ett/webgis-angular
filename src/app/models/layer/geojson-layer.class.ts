import { Layer } from './layer.class';

export class GeoJsonLayer extends Layer {
    url: string;

    constructor(id: string, layerType: string, url: string, label?: string) {
        super(id, layerType, label);
        this.url = url;
    }
}