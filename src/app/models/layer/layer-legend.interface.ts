export interface LayerLegend {
    layerId: string;
    unit: string;
    colorScaleId: string;
    min?: number;
    max?: number;
    labels?: string[];
}