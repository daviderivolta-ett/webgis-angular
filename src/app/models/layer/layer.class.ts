import { LayerLegend } from './layer-legend.interface';

export abstract class Layer {
    id: string;
    url: string;
    layerType: string;
    layerCategory?: string;
    label?: string;
    longLabel?: string;
    legend?: LayerLegend;
    iconUrl?: string;
    requiresAuth?: boolean;
    action?: any;

    constructor(
        id: string,
        url: string,
        layerType: string,
        layerCategory?: string,
        label?: string,
        longLabel?: string,
        iconUrl?: string
    ) {
        this.id = id;
        this.url = url;
        this.layerType = layerType;
        this.layerCategory = layerCategory;
        this.label = label;
        this.longLabel = longLabel;
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
            ...(object.steps ? { steps: object.steps } : {}),
            hasRelativeSteps : object.hasRelativeSteps ?? false
        };

        return this;
    }

    public createUrlWithDate(date: Date): string {
        const halfHour: number = 30 * 60 * 1000;
        return `${this.url}/?fromDate=${new Date(date.getTime() - halfHour).toISOString()}&toDate=${new Date(date.getTime() + halfHour).toISOString()}`;
    }
}