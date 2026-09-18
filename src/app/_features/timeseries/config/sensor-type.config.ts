/* Types */
import { PlotlySettings } from '../types/plotly-settings.type'

/* Parsers */
import { parseMeanAirTemp } from '../services/timeserie.parser'

/* Config */
export const SENSOR_TYPE_PARSERS: Map<string, (data: Map<string, [number, number][]>, settings: PlotlySettings, ctx?: Record<string, any>) => PlotlySettings> = new Map([
    [
        'mean_air_temp', parseMeanAirTemp
    ]
]);