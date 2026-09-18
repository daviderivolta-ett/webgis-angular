/* Types */
import { PlotlySettings } from '../models'

/* Parsers */
export function parseMeanAirTemp(data: Map<string, [number, number][]>, settings: PlotlySettings): PlotlySettings {
    // console.log(settings);

    if (!settings.traces.every(isScatterTrace)) return settings;

    const traces: Plotly.PlotData[] = settings.traces.map((t) => {
        const trace = t as Plotly.ScatterData & { meta?: any };

        const traceId = (trace.meta && 'id' in trace.meta) ? trace.meta.id : '';
        const traceData = data.get(traceId) ?? [];

        return {
            ...t,
            x: traceData.map(([t,]) => t),
            y: traceData.map(([, v]) => v)
        } as Plotly.PlotData
    });

    const layout = {
        ...settings.layout
    }

    const config = {
        ...settings.config
    }

    return { traces, config, layout }
}

function isScatterTrace(t: Plotly.Data): t is Plotly.ScatterData {
    return t.type === 'scatter';
}