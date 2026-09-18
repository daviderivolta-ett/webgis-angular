export function lastX({ traces }: { traces?: Plotly.PlotData[] }): number {
    const array = [...new Set(traces?.flatMap((d) => (d.x as number[]) ?? []))];
    return array[array.length - 1]
}

export function date({ date }: { date?: Date }): number {
    return date ? date.getTime() : new Date().getTime();
}

export function yellowThreshold({ thresholds }: { thresholds?: Record<string, number> }): number | undefined {   
    return thresholds && 'yellow' in thresholds ? thresholds['yellow'] : 0
}

export function orangeThreshold({ thresholds }: { thresholds?: Record<string, number> }): number | undefined {
    return thresholds && 'orange' in thresholds ? thresholds['orange'] : 0
}

export function redThreshold({ thresholds }: { thresholds?: Record<string, number> }): number | undefined {
    return thresholds && 'red' in thresholds ? thresholds['red'] : 0
}

export function yMin({ thresholds }: { thresholds?: Record<string, number> }): number {
    return thresholds && 'yMin' in thresholds ? thresholds['yMin'] : 0
}

export function yMax({ thresholds }: { thresholds?: Record<string, number> }): number {
    return thresholds && 'yMax' in thresholds ? thresholds['yMax'] : 0
}