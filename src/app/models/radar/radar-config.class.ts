export class RadarConfig {
    public id: string;
    public url: string;
    public label?: string;

    constructor(id: string, url: string) {
        this.id = id;
        this.url = url;
    }

    static createFromObject(object: any): RadarConfig {
        if (!('id' in object) || typeof object['id'] !== 'string') {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        if (!('url' in object) || typeof object['url'] !== 'string') {
            throw new Error('Oggetto non valido: \'url\' mancante.');
        }

        const config = new RadarConfig(object['id'], object['url']);

        if ('label' in object && typeof object['label'] === 'string') config.label = object['label'];

        return config;
    }
}