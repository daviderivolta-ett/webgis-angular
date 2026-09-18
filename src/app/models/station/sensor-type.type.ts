/* Types */
import { PlotlySettings } from '../ui'

/* Type */
export type SensorType2 = {
    id: string;
    param: string;
    iconUrl: string;
    label: string;
    chartId: string;
    parser: string;
    plotly: PlotlySettings;
    relatedSensors: string[];
    isFeatured: boolean;
    defaultTimeGap: number;
}