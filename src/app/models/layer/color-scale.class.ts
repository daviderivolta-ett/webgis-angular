import { ColorScaleBase } from './color-scale-base.interface';
import { LayerLegend } from './layer-legend.interface';

export class ColorScale implements ColorScaleBase, Omit<LayerLegend, 'layerId' | 'unit' | 'colorScaleId'> {
    public id: string;
    public colors: string[];
    public type: 'linear' | 'logarithmic';
    public min?: number;
    public max?: number;
    public labels?: string[];

    constructor(scaleBase: ColorScaleBase, layerLegend: LayerLegend) {
        this.id = scaleBase.id;
        this.colors = scaleBase.colors;
        this.type = scaleBase.type;
        this.min = layerLegend.min;
        this.max = layerLegend.max;
        this.labels = layerLegend.labels;
    }

    public calculateLabels(): string[] {
        if (this.min === undefined || this.max === undefined) {
            throw new Error(`[ColorScale ${this.id}] Impossibile calcolare le labels: 'min' o 'max' non definiti.`);
        }

        const labels: string[] = [];
        const steps = this.colors.length;
        const range = this.max - this.min;
        const stepSize = range / (steps - 1);

        for (let i = 0; i < steps; i++) {
            const value = this.min + i * stepSize;
            labels.push(value.toFixed(2));
        }

        return labels;
    }

    public getColor(value: number): string {
        if (this.min === undefined || this.max === undefined) {
            throw new Error(`[ColorScale ${this.id}] Impossibile calcolare il colore: 'min' o 'max' non definiti.`);
        }

        const range = this.max - this.min;
        const stepSize = range / (this.colors.length - 1);
        const index = Math.floor((value - this.min) / stepSize);

        return this.colors[Math.max(0, Math.min(index, this.colors.length - 1))];
    }
}