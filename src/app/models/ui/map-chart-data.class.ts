export class MapChartData {
    public sensor: string;
    public type: string;
    public data: [number, number][];
    public legend?: string;
    public unit?: string;
    public style?: Record<string, any>;
    public yLabel?: string;
    public yUnit?: string;
    public yRange?: any[];
    public needsAdditionalYAxis?: boolean;
    public isMainYAxis?: boolean;
    public isCumulated?: boolean;

    constructor(
        sensor: string,
        type: string,
        data: [number, number][],
        legend?: string,
        unit?: string,
        style?: Record<string, any>,
        yLabel?: string,
        yUnit?: string,
        yRange?: any[],
        needsAdditionalYAxis?: boolean,
        isMainYAxis?: boolean,
        isCumulated?: boolean
    ) {
        this.sensor = sensor;
        this.type = type;
        this.data = data;
        this.legend = legend;
        this.unit = unit;
        this.style = style;
        this.yLabel = yLabel,
        this.yUnit = yUnit,
        this.yRange = yRange
        this.needsAdditionalYAxis = needsAdditionalYAxis;
        this.isMainYAxis = isMainYAxis;
        this.isCumulated = isCumulated;
    }
}