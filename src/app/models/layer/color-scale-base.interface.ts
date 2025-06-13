export interface ColorScaleBase {
    id: string;
    colors: string[],
    type: 'linear' | 'logarithmic'
}