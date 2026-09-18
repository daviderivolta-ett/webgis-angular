/* Types */
import { PlotlySettings } from './plotly-settings.type'
import { SensorType } from '../station'

/* Type */
export type Chart = {
    id: string;
    stationId: string;
    stationName?: string;
    sensors: SensorType[];
    plotly: PlotlySettings;
}