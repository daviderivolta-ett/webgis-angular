export interface SensorType {
    id: string;
    iconUrl: string;
    label: string;
    chartType: 'line' | 'bar';
    style?: Record<string, any>;
    unit: string;
    decimals: number;
    multiplier?: number;
    range?: any[];
    defaultTimeGap?: number;
    isFeatured: boolean;
    relatedSensors: string[];
    compareWith: string;
    isMainYAxis?: boolean;
    baseColor?: string;
    thresholdKeys?: string[];
    hideZeroXAxis?: boolean;
}