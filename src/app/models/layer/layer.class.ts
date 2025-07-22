import { LayerLegend } from './layer-legend.interface';

export abstract class Layer {
    id: string;
    url: string;
    layerType: string;
    layerCategory?: string;
    label?: string;
    legend?: LayerLegend;
    iconUrl?: string;
    action?: any;

    constructor(
        id: string,
        url: string,
        layerType: string,
        layerCategory?: string,
        label?: string,
        iconUrl?: string
    ) {
        this.id = id;
        this.url = url;
        this.layerType = layerType;
        this.layerCategory = layerCategory;
        this.label = label;
        this.iconUrl = iconUrl;
    }

    public addLegendFromObject(object: any): this {
        const hasMinMax: boolean = object.min !== undefined && object.max !== undefined;
        const hasLabels: boolean = Array.isArray(object.labels);
        const hasSteps: boolean = Array.isArray(object.steps);

        if (!hasMinMax && !hasLabels && !hasSteps) {
            throw new Error(`La legenda deve avere almeno uno tra: 'min' e 'max', 'labels', oppure 'steps'.`);
        }

        this.legend = {
            layerId: this.id,
            unit: object.unit,
            colorScaleId: object.colorScaleId ?? 'rainbow',
            ...(object.min !== undefined ? { min: object.min } : {}),
            ...(object.max !== undefined ? { max: object.max } : {}),
            ...(object.labels ? { labels: object.labels } : {}),
            ...(object.steps ? { steps: object.steps } : {})
        };

        return this;
    }

    public createUrlWithDate(date: Date): string {
        return `${this.url}/${date.getTime()}`;
    }
}