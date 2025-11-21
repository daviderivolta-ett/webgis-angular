export class MapChartData {
    public type: string;
    public data: [number, number][];
    public legend?: string;
    public unit?: string;
    public style?: Record<string, any>;

    constructor(
        type: string,
        data: [number, number][],
        legend?: string,
        unit?: string,
        style?: Record<string, any>
    ) {
        this.type = type;
        this.data = data;
        this.legend = legend;
        this.unit = unit;
        this.style = style;
    }
}