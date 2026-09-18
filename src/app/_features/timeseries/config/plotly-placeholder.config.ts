import { date, lastX, orangeThreshold, redThreshold, yellowThreshold, yMax, yMin } from '../services'

export const PLOTLY_PLACEHOLDER_PARSERS: Map<string, (...args: any[]) => unknown> = new Map<string, (...args: any[]) => unknown>([
    ['x_last', lastX],
    ['date', date],
    ['yellow', yellowThreshold],
    ['orange', orangeThreshold],
    ['red', redThreshold],
    ['y_min', yMin],
    ['y_max', yMax]
]);