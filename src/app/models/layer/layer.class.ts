import { LayerLegend } from './layer-legend.interface';

export abstract class Layer {
    id: string;
    layerType: string;
    layerCategory?: string;
    label?: string;
    legend?: LayerLegend;
    iconUrl?: string;
    action?: any;

    constructor(
        id: string,
        layerType: string,
        layerCategory?: string,
        label?: string,
        iconUrl?: string
    ) {
        this.id = id;
        this.layerType = layerType;
        this.layerCategory = layerCategory;
        this.label = label;
        this.iconUrl = iconUrl;
    }

    public addLegendFromObject(object: any): this {
        if (!object['unit']) {
            throw new Error('Una legenda deve avere il campo \'unit\' unità di misura.');
        }

        if (!object.labels && (object.min === undefined || object.max === undefined)) {
            throw new Error(`La legenda deve avere valori \'min\' e \'max\' oppure delle \'labels\'.`);
        }

        this.legend = {
            layerId: this.id,
            unit: object.unit,
            colorScaleId: object.colorScaleId ?? 'rainbow',
            ...(object.min !== undefined ? { min: object.min } : {}),
            ...(object.max !== undefined ? { max: object.max } : {}),
            ...(object.labels ? { labels: object.labels } : {})
        };

        return this;
    }
}