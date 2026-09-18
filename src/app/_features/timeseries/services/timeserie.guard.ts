export function isScatterTrace(t: Plotly.Data): t is Plotly.ScatterData {
    return t.type === 'scatter';
}