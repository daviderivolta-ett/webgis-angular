/* Types */
import { PlotlySettings } from '../models'

/* Parsers */
import { parseMeanAirTemp } from './sensor-type.service'

/* Config */
export const SENSOR_TYPE_PARSERS: Map<string, (data: Map<string, [number, number][]>, settings: PlotlySettings) => PlotlySettings> = new Map([
    [
        'mean_air_temp', parseMeanAirTemp
    ]
]);