export interface SensorType {
    id: string;
    iconUrl: string;
    label: string;
    chartType: 'line' | 'bar';
    unit: string;
    range?: any[];
    isFeatured: boolean;
    relatedSensors: string[];
}