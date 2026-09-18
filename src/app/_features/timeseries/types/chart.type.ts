/* Types */
import { SensorType2 } from '../../../models'
import { PlotlySettings } from './plotly-settings.type'

/* Type */
export type Chart = {
    id: string;
    stationId: string;
    stationName?: string;
    sensors: SensorType2[];
    plotly: PlotlySettings;
}