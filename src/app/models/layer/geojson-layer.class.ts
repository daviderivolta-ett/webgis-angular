import { FeatureFilter } from './feature-filter.interface';
import { Layer } from './layer.class';
import { MarkerMapping } from './marker-mapping.interface';

export class GeoJsonLayer extends Layer {
    public parameter?: string;
    public decimals?: number;
    public multiplier?: number;
    public filter?: FeatureFilter;
    public markers?: MarkerMapping;
    public showValueOnZoom?: boolean;

    constructor(
        id: string,
        layerType: string,
        url: string,
        layerCategory?: string,
        label?: string,
        longLabel?: string,
        iconUrl?: string,
        parameter?: string,
        decimals?: number,
        multiplier?: number,
        filter?: FeatureFilter,
        markers?: MarkerMapping,
        showValueOnZoom?: boolean
    ) {
        super(id, url, layerType, label, longLabel, iconUrl, layerCategory);
        this.parameter = parameter;
        this.decimals = decimals;
        this.multiplier = multiplier;
        this.filter = filter;
        this.markers = markers;
        this.showValueOnZoom = showValueOnZoom;
    }

    static createFromObject(object: any): GeoJsonLayer {      
        const layer: GeoJsonLayer = new GeoJsonLayer(
            (typeof object['id'] === 'string' && object['id']) || '',
            (typeof object['layerType'] === 'string' && object['layerType']) || 'base',
            (typeof object['url'] === 'string' && object['url']) || ''
        );

        if (object['parameter'] && typeof object['parameter'] === 'string') layer.parameter = object['parameter'];
        if ('decimals' in object && typeof object['decimals'] === 'number') layer.decimals = object['decimals'];
        if (object['multiplier'] && typeof object['multiplier'] === 'number') layer.multiplier = object['multiplier'];
        if (object['filter'] && typeof object['filter'] === 'object') layer.addFeatureFilterFromObject(object['filter']);
        if (object['markers'] && typeof object['markers'] === 'object') layer.addCustomMarkersFromArray(object['markers']);
        if ('showValueOnZoom' in object && typeof object['showValueOnZoom'] === 'boolean') layer.showValueOnZoom = object['showValueOnZoom'] ?? false;
        if (typeof object['layerCategory'] === 'string' && object['layerCategory']) layer.layerCategory = object['layerCategory'];
        if (typeof object['label'] === 'string' && object['label']) layer.label = object['label'];
        if (typeof object['longLabel'] === 'string' && object['longLabel']) layer.longLabel = object['longLabel'];
        if ('legend' in object && object['legend']) layer.addLegendFromObject(object['legend']);
        if (typeof object['iconUrl'] === 'string' && object['iconUrl']) layer.iconUrl = object['iconUrl'];
        layer.requiresAuth = object['requiresAuth'] ?? false;
        if (object['action']) layer.action = { ...object['action'] };       

        return layer;
    }

    public addFeatureFilterFromObject(object: any): this {
        if (
            'featureProperty' in object && typeof object['featureProperty'] === 'string' &&
            'rule' in object && typeof object['rule'] === 'object'
        ) {
            this.filter = {
                featureProperty: object['featureProperty'],
                rule: {
                    comparisonOperator: 'comparisonOperator' in object['rule'] && typeof object['rule']['comparisonOperator'] === 'string' ? object['rule']['comparisonOperator'] : '',
                    value: 'value' in object['rule'] && (typeof object['rule']['value'] === 'string' || typeof object['rule']['value'] === 'number') ? object['rule']['value'] : ''
                }
            }
        }

        return this;
    }

    public addCustomMarkersFromArray(markers: any): this {
        if (
            'featureProperty' in markers && typeof markers['featureProperty'] === 'string' &&
            'rules' in markers && Array.isArray(markers['rules'])
        ) {
            this.markers = {
                featureProperty: markers['featureProperty'],
                rules: markers['rules'].map((m: any) => {
                    if (
                        'comparisonOperator' in m && typeof m['comparisonOperator'] === 'string' &&
                        'threshold' in m && (typeof m['threshold'] === 'string' || typeof m['threshold'] === 'number') &&
                        'shapeId' in m && typeof m['shapeId'] === 'number'
                    ) {
                        return {
                            comparisonOperator: m['comparisonOperator'],
                            threshold: m['threshold'],
                            shapeId: m['shapeId']
                        }
                    }
                    return undefined;
                }).filter((m) => m !== undefined)
            }
        }

        return this;
    }
}