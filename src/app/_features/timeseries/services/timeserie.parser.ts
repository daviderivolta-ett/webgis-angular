/* Config */
import { PLOTLY_PLACEHOLDER_PARSERS } from '../config/plotly-placeholder.config'

/* Types */
import { PlotlySettings } from '../types/plotly-settings.type'

/* Services */
import { traverseLayout } from './plotly.service'

/* Type guards */
import { isScatterTrace } from './timeserie.guard'

/* Parsers */
export function parseMeanAirTemp(data: Map<string, [number, number][]>, settings: PlotlySettings, ctx?: Record<string, any>): PlotlySettings {
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

    const layout = traverseLayout(
        settings.layout,
        PLOTLY_PLACEHOLDER_PARSERS,
        { traces, ...ctx }
    ) as Partial<Plotly.Layout>;

    const config = {
        ...settings.config
    }

    return { traces, config, layout }
}