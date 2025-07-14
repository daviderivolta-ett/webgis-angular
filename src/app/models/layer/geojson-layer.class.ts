import { Layer } from './layer.class';
import { LayerMaker } from './layer-marker.interface';

export class GeoJsonLayer extends Layer {
    public url: string;
    public markers?: LayerMaker[];

    constructor(
        id: string,
        layerType: string,
        url: string,
        markers?: LayerMaker[],
        layerCategory?: string,
        label?: string,
        iconUrl?: string
    ) {
        super(id, layerType, label, iconUrl, layerCategory);
        this.url = url;
        this.markers = markers;
    }

    static createFromObject(object: any): GeoJsonLayer {
        const layer: GeoJsonLayer = new GeoJsonLayer(
            (typeof object['id'] === 'string' && object['id']) || '',
            (typeof object['layerType'] === 'string' && object['layerType']) || 'base',
            (typeof object['url'] === 'string' && object['url']) || ''
        );

        if (object['markers'] && Array.isArray(object['markers'])) layer.addCustomMarkersFromArray(object['markers']);
        if (typeof object['layerCategory'] === 'string' && object['layerCategory']) layer.layerCategory = object['layerCategory'];
        if (typeof object['label'] === 'string' && object['label']) layer.label = object['label'];
        if ('legend' in object && object['legend']) layer.addLegendFromObject(object['legend']);
        if (typeof object['iconUrl'] === 'string' && object['iconUrl']) layer.iconUrl = object['iconUrl'];
        if (object['action']) layer.action = { ...object['action'] };

        return layer;
    }

    public addCustomMarkersFromArray(markers: any[]): this {       
        this.markers = markers.map((m: any) => {
            if (
                m['comparisonOperator'] && typeof m['comparisonOperator'] === 'string' &&
                m['threshold'] && typeof m['threshold'] === 'number' &&
                m['shapeId'] && typeof m['shapeId'] === 'number'
            ) {                
                return {
                    comparisonOperator: m['comparisonOperator'],
                    threshold: m['threshold'],
                    shapeId: m['shapeId']
                }
            }
            return undefined;
        }).filter((m) => m !== undefined);

        return this;
    }
}