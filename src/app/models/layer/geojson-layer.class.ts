import { Layer } from './layer.class';

export class GeoJsonLayer extends Layer {
    url: string;

    constructor(
        id: string,
        layerType: string,
        url: string,
        layerCategory?: string,
        label?: string,
        iconUrl?: string
    ) {
        super(id, layerType, label, iconUrl,layerCategory);
        this.url = url;
    }

    static createFromObject(object: any): GeoJsonLayer {
        const layer: GeoJsonLayer = new GeoJsonLayer(
            (typeof object['id'] === 'string' && object['id']) || '',
            (typeof object['layerType'] === 'string' && object['layerType']) || 'base',
            (typeof object['url'] === 'string' && object['url']) || ''
        );

        if (typeof object['layerCategory'] === 'string' && object['layerCategory']) layer.layerCategory = object['layerCategory'];
        if (typeof object['label'] === 'string' && object['label']) layer.label = object['label'];
        if (typeof object['iconUrl'] === 'string' && object['iconUrl']) layer.iconUrl = object['iconUrl'];
        if (object['action']) layer.action = { ...object['action'] };

        return layer;
    }
}