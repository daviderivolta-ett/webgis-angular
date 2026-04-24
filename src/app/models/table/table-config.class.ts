import { TableColorConfig } from './table-config-color.class'

export class TableConfig {
    public id: string;
    public url: string;
    public label?: string;
    public filterKeys?: string[];
    public dataPath?: string;
    public keysToHide?: string[];
    public keysToKeep?: string[];
    public keysToMerge?: string[];
    public keysOrder?: string[];
    public labels?: Map<string, string>;
    public multiplier?: number;
    public decimals?: number;
    public parameter?: string;
    public colors?: TableColorConfig[];
    public actionKey?: string;

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
        if ('keysToHide' in object && Array.isArray(object['keysToHide']) && object['keysToHide'].every((k: any) => typeof k === 'string')) config.keysToHide = [...object['keysToHide']];
        if ('keysToKeep' in object && Array.isArray(object['keysToKeep']) && object['keysToKeep'].every((k: any) => typeof k === 'string')) config.keysToKeep = [...object['keysToKeep']];
        if ('keysToMerge' in object && Array.isArray(object['keysToMerge'])) config.keysToMerge = [...object['keysToMerge']];
        if ('keysOrder' in object && Array.isArray(object['keysOrder']) && object['keysOrder'].every((k: any) => typeof k === 'string')) config.keysOrder = [...object['keysOrder']];
        if ('labels' in object && typeof object['labels'] === 'object') config.labels = new Map(Object.entries(object['labels']));
        if ('multiplier' in object && typeof object['multiplier'] === 'number') config.multiplier = object['multiplier'];
        if ('decimals' in object && typeof object['decimals'] === 'number') config.decimals = object['decimals'];
        if ('parameter' in object && typeof object['parameter'] === 'string') config.parameter = object['parameter'];
        if ('colors' in object && Array.isArray(object['colors'])) config.colors = object['colors'].map((c) => TableColorConfig.createFromObject(c));
        if ('actionKey' in object && typeof object['actionKey'] === 'string') config.actionKey = object['actionKey'];        

        return config;
    }
}