export interface SensorType {
    id: string;
    iconUrl: string;
    label: string;
    chartType: 'line' | 'bar';
    traceType?: string,
    style?: Record<string, any>;
    unit: string;
    range?: any[];
    isFeatured: boolean;
    relatedSensors: string[];
}