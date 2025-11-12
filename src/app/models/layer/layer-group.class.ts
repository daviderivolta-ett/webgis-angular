import { GeoJsonLayer } from './geojson-layer.class';
import { Layer } from './layer.class';
import { TileLayer } from './tile-layer.class';
import { WMSLayer } from './wms-layer.class';

export class LayerGroup {
    public id: string;
    public label?: string;
    public maxNumber?: number;
    public iconUrl?: string;
    public options?: (LayerGroup | Layer)[];
    public requiresAuth?: boolean;

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
        layerGroup.requiresAuth = ('requiresAuth' in object && typeof object['requiresAuth'] === 'boolean') ? object['requiresAuth'] : false;

        if ('options' in object && Array.isArray(object['options'])) {
            layerGroup.options = object['options'].map((el: any) => {
                try {
                    if (el['layerType']) return LayerGroup.resolveLayerType(el);
                    else return LayerGroup.createFromObject(el);
                } catch (error) {
                    console.warn('Opzione ignorata per errore:', el, error);
                    return null;
                }
            }).filter((el) => el !== null);
        } else {
            layerGroup.options = [];
        }

        return layerGroup;
    }

    static resolveLayerType(object: any): TileLayer | WMSLayer | GeoJsonLayer | null {
        if (!object['layerType']) return null;

        switch (object['layerType']) {
            case 'base':
                return TileLayer.createFromObject(object);
            case 'wms':
                return WMSLayer.createFromObject(object);
            case 'geojson':
                return GeoJsonLayer.createFromObject(object);
            default:
                return null;
        }
    }

    public searchLayerById(id: string, group: LayerGroup = this): Layer | undefined {
        if (group.options) {
            for (const child of group.options) {
                if (child instanceof Layer && child.id === id) {
                    return child;
                }
                else if (child instanceof LayerGroup) {
                    const found: LayerGroup | Layer | undefined = this.searchLayerById(id, child);
                    if (found) return found;
                }
            }
        }
        return undefined;
    }

    public searchGeoJsonLayerByParameter(param: string, group: LayerGroup = this): Layer | undefined {
        if (!group.options) return undefined;

        for (const child of group.options) {
            if (child instanceof GeoJsonLayer && child.parameter === param) {
                return child;
            } else if (child instanceof LayerGroup) {
                const found = this.searchGeoJsonLayerByParameter(param, child);
                if (found) return found; 
            }
        }

        return undefined;
    }

    static getAllLayers(groups: LayerGroup[]): Layer[] {
        let layers: Layer[] = [];

        for (const group of groups) {
            if (group.options) {
                for (const option of group.options) {
                    if (option instanceof Layer) layers.push(option);
                    else if (option instanceof LayerGroup) layers = layers.concat(this.getAllLayers([option]));
                }
            }
        }

        return layers;
    }

    static getAllLayerGroups(groups: LayerGroup[]): LayerGroup[] {
        let result: LayerGroup[] = [];

        for (const group of groups) {
            result.push(group);

            if (group.options) {
                for (const option of group.options) {
                    if (option instanceof LayerGroup) {
                        result.push(option);
                        result.push(...this.getAllLayerGroups([option]));
                    }
                }
            }
        }

        return result;
    }

    static getAuthLayerGroups(groups: LayerGroup[], isAuth: boolean) {
        let result: string[] = [];

        for (const group of groups) {
            if (!group.requiresAuth || isAuth) result.push(group.id);

            if (group.options) {
                for (const option of group.options) {
                    if (option instanceof LayerGroup) {
                        if (!option.requiresAuth || isAuth) result.push(option.id);
                        result.push(...this.getAuthLayerGroups([option], isAuth));
                    } else {
                        result.push(option.id);
                    }
                }
            }
        }

        return result;
    }
}