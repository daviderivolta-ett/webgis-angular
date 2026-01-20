export class TableColorConfig {
    public key: string;
    public steps: number[];
    public backgroundColors: string[];

    constructor(key: string, steps: number[], backgroundColors: string[]) {
        this.key = key;
        this.steps = steps;
        this.backgroundColors = backgroundColors;
    }

    static createFromObject(object: any): TableColorConfig {
        if (!('key' in object) || typeof object['key'] !== 'string') {
            throw new Error('Oggetto non valido: \'key\' mancante.');
        }

        if (!('steps' in object) || !Array.isArray(object['steps'])) {
            throw new Error('Oggetto non valido: \'steps\' mancante.');
        }

        if (!('backgroundColors' in object) || !Array.isArray(object['backgroundColors'])) {
            throw new Error('Oggetto non valido: \'backgroundColors\' mancante.');
        }

        return new TableColorConfig(object['key'], object['steps'], object['backgroundColors']);
    }

    public getBackgroundColor(value: number): string {
        const foundIndex: number = this.steps.findIndex((i) => Number.isFinite(i) && value < i);
        const safeIndex = foundIndex === -1 ? this.steps.length : foundIndex;        
        return this.backgroundColors[safeIndex];
    }

}