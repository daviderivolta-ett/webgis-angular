export class TableConfig {
    public id: string;
    public url: string;
    public label?: string;
    public filterKeys?: string[];
    public dataPath?: string;
    public keysToMerge?: string[];
    public keysOrder?: string[];

    constructor(id: string, url: string) {
        this.id = id;
        this.url = url;
    }

    static createFromObject(object: any): TableConfig {
        if (!('id' in object) || typeof object['id'] !== 'string') {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        if (!('url' in object) || typeof object['url'] !== 'string') {
            throw new Error('Oggetto non valido: \'url\' mancante.');
        }

        const config = new TableConfig(object['id'], object['url']);

        if ('label' in object && typeof object['label'] === 'string') config.label = object['label'];
        if ('filterKeys' in object && Array.isArray(object['filterKeys']) && object['filterKeys'].every((k: any) => typeof k === 'string')) config.filterKeys = [...object['filterKeys']];
        if ('dataPath' in object && typeof object['dataPath'] === 'string') config.dataPath = object['dataPath'];
        if ('keysToMerge' in object && Array.isArray(object['keysToMerge']) && object['keysToMerge'].every((k: any) => typeof k === 'string')) config.keysToMerge = [...object['keysToMerge']];
        if ('keysOrder' in object && Array.isArray(object['keysOrder']) && object['keysOrder'].every((k: any) => typeof k === 'string')) config.keysOrder = [...object['keysOrder']];

        return config;
    }
}