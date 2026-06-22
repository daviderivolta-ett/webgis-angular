export interface LayerLegend {
    layerId: string;
    unit?: string;
    altUnit?: string;
    colorScaleId: string;
    min?: number;
    max?: number;
    labels?: string[];
    steps?: number[];
    multiplier?: number;
    hasRelativeSteps?: boolean;
}