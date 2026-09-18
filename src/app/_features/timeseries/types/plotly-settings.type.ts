export type PlotlySettings = {
    traces: Plotly.Data[],
    layout: Partial<Plotly.Layout>,
    config: Partial<Plotly.Config>
}