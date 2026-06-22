import { RadarConfig } from './radar-config.class';

export class RadarConfigGroup {
    public id: string;
    public options: (RadarConfigGroup | RadarConfig)[];
    public label?: string;
    public maxNumber?: number;

    constructor(id: string, options: RadarConfigGroup[] | RadarConfig[]) {
        this.id = id;
        this.options = options;
    }

    static createFromObject(data: any): RadarConfigGroup {
        if (!('id' in data) || typeof data['id'] !== 'string') throw new Error('Una table config group deve avere il campo \'id\'');

        const config = new RadarConfigGroup(data['id'], []);

        if (data['label'] && typeof data['label'] === 'string') config.label = data['label'];
        if ('maxNumber' in data && typeof data['maxNumber'] === 'number') config.maxNumber = data['maxNumber'];
        if (data['options'] && Array.isArray(data['options'])) config.options = data['options'].map((d: any) => {
            try {
                if ('url' in d) return RadarConfig.createFromObject(d);
                else return RadarConfigGroup.createFromObject(d);
            } catch (error) {
                console.warn('Opzione ignorata per errore:', d, error);
                return null;
            }
        }).filter((d) => d !== null);

        return config;
    }

    public getRadarConfig(id: string): RadarConfig | undefined {
        for (const o of this.options) {
            if (o instanceof RadarConfigGroup) {
                const found = o.getRadarConfig(id);
                if (found) return found;
            } else {
                if (o.id === id) return o;
            }
        }
        return undefined;
    }
}