import { Layer } from './layer.class';
import { WMSLayerParams } from './wms-params.interface';

export class WMSLayer extends Layer {
    public params: WMSLayerParams;
    public opacity: number;
    public decimals?: number;
    public multiplier?: number;

    constructor(
        id: string,
        layerType: string,
        url: string,
        params: WMSLayerParams,
        opacity?: number,
        label?: string,
        longLabel?: string,
        iconUrl?: string,
        layerCategory?: string,
        decimals?: number,
        multiplier?: number,
    ) {
        super(id, url, layerType, label, longLabel, iconUrl, layerCategory);
        this.url = url;
        this.params = params;
        this.opacity = opacity ?? 1;
        this.decimals = decimals ?? 1;
        this.multiplier = multiplier;
    }

    static createFromObject(object: any): WMSLayer {
        const rawParams = object['params'] || {};

        const params: WMSLayerParams = {
            layers: (typeof rawParams['layers'] === 'string' && rawParams['layers']) || '',
            format: (typeof rawParams['format'] === 'string' && rawParams['format']) || 'image/png',
            version: (typeof rawParams['version'] === 'string' && rawParams['version']) || '1.1.1',
            srs: (typeof rawParams['srs'] === 'string' && rawParams['srs']) || 'EPSG:3857',
            styles: typeof rawParams['styles'] === 'string' ? rawParams['styles'] : undefined,
            transparent: typeof rawParams['transparent'] === 'boolean' ? rawParams['transparent'] : undefined,
        };

        const layer: WMSLayer = new WMSLayer(
            (typeof object['id'] === 'string' && object['id']) || '',
            (typeof object['layerType'] === 'string' && object['layerType']) || '',
            (typeof object['url'] === 'string' && object['url']) || '',
            params,
            typeof object['opacity'] === 'number' ? object['opacity'] : 1
        );

        if (typeof object['layerCategory'] === 'string' && object['layerCategory']) layer.layerCategory = object['layerCategory'];
        if (typeof object['label'] === 'string' && object['label']) layer.label = object['label'];
        if (typeof object['longLabel'] === 'string' && object['longLabel']) layer.longLabel = object['longLabel'];
        if ('legend' in object && object['legend']) layer.addLegendFromObject(object['legend']);
        if (typeof object['iconUrl'] === 'string' && object['iconUrl']) layer.iconUrl = object['iconUrl'];
        layer.requiresAuth = object['requiresAuth'] ?? false;
        if (object['action']) layer.action = { ...object['action'] };
        if ('decimals' in object && typeof object['decimals'] === 'number') layer.decimals = object['decimals'];
        if (object['multiplier'] && typeof object['multiplier'] === 'number') layer.multiplier = object['multiplier'];

        return layer;
    }

    static isWMSLayer(object: any): object is WMSLayer {
        return (
            object &&
            typeof object === 'object' &&
            typeof object.id === 'string' &&
            typeof object.url === 'string' &&
            typeof object.layers === 'string' &&
            typeof object.format === 'string' &&
            typeof object.version === 'string' &&
            typeof object.srs === 'string'
        );
    }
}