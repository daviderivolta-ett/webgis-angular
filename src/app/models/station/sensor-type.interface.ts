export interface SensorType {
    id: string;
    iconUrl: string;
    label: string;
    chartType: 'line' | 'bar';
    style?: Record<string, any>;
    unit: string;
    multiplier?: number;
    range?: any[];
    isFeatured: boolean;
    relatedSensors: string[];
    compareWith: string;
    isMainYAxis?: boolean;
    thresholdKeys?: string[];
}