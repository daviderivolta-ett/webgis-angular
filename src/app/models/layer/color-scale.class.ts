import { ColorScaleBase } from './color-scale-base.interface';
import { LayerLegend } from './layer-legend.interface';

export class ColorScale implements ColorScaleBase, Omit<LayerLegend, 'layerId' | 'unit' | 'colorScaleId'> {
    public id: string;
    public colors: string[];
    public type: 'linear' | 'logarithmic';
    public min?: number;
    public max?: number;
    public labels?: string[];
    public steps?: number[];
    public altUnit?: string;
    public multiplier?: number;
    public hasRelativeSteps?: boolean;

    constructor(scaleBase: ColorScaleBase, layerLegend: LayerLegend) {
        this.id = scaleBase.id;
        this.colors = scaleBase.colors;
        this.type = scaleBase.type;
        this.min = layerLegend.min;
        this.max = layerLegend.max;
        this.labels = layerLegend.labels;
        this.steps = layerLegend.steps;
        this.altUnit = layerLegend.altUnit;
        this.multiplier = layerLegend.multiplier;
        this.hasRelativeSteps = layerLegend.hasRelativeSteps;
    }

    public calculateTicks(): string[] {
        if (this.steps) {
            if (!Array.isArray(this.steps) || this.steps.length === 0) {
                throw new Error(`Gli 'steps' devono essere un array non vuoto.`);
            }

            let labels: string[] = [];

            labels.push(`<${this.steps[0]}`);
            labels = [...labels, ...this.steps.map((v: number) => String(v))];
            labels.push(`>${this.steps[this.steps.length - 1]}`);

            return labels;
        }

        if (this.min === undefined || this.max === undefined) {
            throw new Error(`Impossibile calcolare le labels: 'min' o 'max' non definiti.`);
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

    public calculateLabels(): string[] {
        if (this.steps) {
            if (!Array.isArray(this.steps) || this.steps.length === 0) {
                throw new Error(`Gli 'steps' devono essere un array non vuoto.`);
            }

            const labels: string[] = [];
            labels.push(`< ${this.steps[0]}`);
            for (let i = 0; i < this.steps.length - 1; i++) {
                labels.push(`${this.steps[i]} - ${this.steps[i + 1]}`);
            }
            labels.push(`> ${this.steps[this.steps.length - 1]}`);
            return labels;
        }

        if (this.min === undefined || this.max === undefined) {
            throw new Error(`Impossibile calcolare le labels: 'min' o 'max' non definiti.`);
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
        // Steps mode
        if (this.steps && this.steps.length >= 1) {
            const numValue: number = +value;
            const index = this.steps.findIndex((step: number) => numValue <= step);
            return this.colors[index === -1 ? (this.colors.length - 1) : index];
        }

        // Numeric mode (min/max defined)
        if (this.min !== undefined && this.max !== undefined) {
            const numValue = +value;
            const steps = this.colors.length - 1;
            const range = this.max - this.min;
            
            const ratio = this.type === 'logarithmic'
                ? (Math.log(numValue) - Math.log(this.min)) / (Math.log(this.max) - Math.log(this.min))
                : (numValue - this.min) / range;

            const index = Math.floor(ratio * steps);
            return this.colors[Math.max(0, Math.min(index, steps))];
        }

        // Labels mode
        // Using array index to calculate a color
        if (this.labels && this.labels.length === this.colors.length) {
            return (value < this.colors.length - 1) ? this.colors[value] : this.colors[0]; // fallback on first color
        }

        throw new Error(`Impossibile determinare il colore: dati insufficienti (min/max o labels mancanti o inconsistenti).`);
    }

    public getRange(): [number, number] | undefined {
        if (this.steps) return [this.steps[0], this.steps[this.steps.length - 1]];
        if (this.min && this.max) return [this.min, this.max];
        return undefined;
    }
}