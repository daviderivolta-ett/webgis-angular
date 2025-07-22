import { Layer } from './layer.class';

export class TileLayer extends Layer {
    // public url: string;
    public attribution: string;

    constructor(
        id: string,
        layerType: string,
        url: string,
        attribution: string,
        layerCategory?: string,
        label?: string,
        iconUrl?: string
    ) {
        super(id, url, layerType, label, iconUrl, layerCategory);
        this.url = url;
        this.attribution = attribution;
    }

    static createFromObject(object: any): TileLayer {
        const layer: TileLayer = new TileLayer(
            (typeof object['id'] === 'string' && object['id']) || '',
            (typeof object['layerType'] === 'string' && object['layerType']) || 'base',
            (typeof object['url'] === 'string' && object['url']) || '',
            (typeof object['attribution'] === 'string' && object['attribution']) || '',
        );

        if (typeof object['layerCategory'] === 'string' && object['layerCategory']) layer.layerCategory = object['layerCategory'];
        if (typeof object['label'] === 'string' && object['label']) layer.label = object['label'];
        if (typeof object['iconUrl'] === 'string' && object['iconUrl']) layer.iconUrl = object['iconUrl'];
        if (object['action']) layer.action = { ...object['action'] };

        return layer;
    }
}