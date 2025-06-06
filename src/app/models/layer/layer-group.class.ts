import { Layer } from './layer.class';
import { TileLayer } from './tile-layer.class';
import { WMSLayer } from './wms-layer.class';

export class LayerGroup {
    id: string;
    label?: string;
    maxNumber?: number;
    iconUrl?: string;
    incompatibleWith: string[] = [];
    options?: (LayerGroup | Layer)[];

    constructor(id: string) {
        this.id = id;
    }

    static createFromObject(object: any): LayerGroup {
        if (!object || !object['id']) {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        const layerGroup: LayerGroup = new LayerGroup(object['id']);

        if ('label' in object && typeof object['label'] === 'string') layerGroup.label = object['label'];
        if ('maxNumber' in object && typeof object['maxNumber'] === 'number') layerGroup.maxNumber = object['maxNumber'];
        if ('iconUrl' in object && typeof object['iconUrl'] === 'string') layerGroup.iconUrl = object['iconUrl'];
        if ('incompatibleWith' in object && Array.isArray(object['incompatibleWith'])) layerGroup.incompatibleWith = object['incompatibleWith'].filter((e: any) => typeof e === 'string');
        if ('options' in object && Array.isArray(object['options'])) layerGroup.options = object['options'].map((el: any) => {
            return el['layerType'] ? LayerGroup.resolveLayerType(el) : LayerGroup.createFromObject(el)
        }).filter((el) => el !== null);

        return layerGroup;
    }

    static resolveLayerType(object: any): TileLayer | WMSLayer | null {
        if (!object['layerType']) return null;

        switch (object['layerType']) {
            case 'base':
                return TileLayer.createFromObject(object);
            case 'wms':
                return WMSLayer.createFromObject(object);

            case 'geojson':
                return null;

            default:
                return null;
        }
    }
}