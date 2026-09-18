/* Types */
import { PlotlySettings, SensorType2 } from '../models'

/* Parser */
export function parseSensorType(data: unknown): SensorType2 {
    if (typeof data !== 'object' || data === null) throw new Error(`Invalid object.`);

    const obj = data as Record<string, unknown>;

    return {
        id: typeof obj['id'] === 'string' ? obj['id'] : '',
        param: typeof obj['param'] === 'string' ? obj['param'] : '',
        iconUrl: typeof obj['iconUrl'] === 'string' ? obj['iconUrl'] : '',
        label: typeof obj['label'] === 'string' ? obj['label'] : '',
        chartId: typeof obj['chartId'] === 'string' ? obj['chartId'] : '',
        parser: typeof obj['parser'] === 'string' ? obj['parser'] : '',
        plotly: obj['plotly'] ? (obj['plotly'] as PlotlySettings) : { traces: [], layout: {}, config: {} },
        relatedSensors: typeof obj['relatedSensors'] === 'object' && Array.isArray(obj['relatedSensors']) ?
            obj['relatedSensors'] :
            [],
        isFeatured: typeof obj['isFeatured'] === 'boolean' ? obj['isFeatured'] : false,
        defaultTimeGap: typeof obj['defaultTimeGap'] === 'number' ? obj['defaultTimeGap'] : 30
    }
}