import { TableConfig } from './table-config.class';

export class TableConfigGroup {
    public id: string;
    public requiresAuth: boolean;
    public options: TableConfig[];
    public label?: string;

    constructor(id: string, options: TableConfig[], requiresAuth: boolean = false) {
        this.id = id;
        this.requiresAuth = requiresAuth;
        this.options = options;
    }

    static createFromObject(data: any): TableConfigGroup {
        if (!('id' in data) || typeof data['id'] !== 'string') throw new Error('Una table config group deve avere il campo \'id\'');

        const config = new TableConfigGroup(data['id'], []);

        if (data['label'] && typeof data['label'] === 'string') config.label = data['label'];
        if ('requiresAuth' in data && typeof data['requiresAuth'] === 'boolean') config.requiresAuth = data['requiresAuth'] ?? false;
        if (data['options'] && Array.isArray(data['options'])) config.options = data['options'].map((d: any) => {
            try {
                return TableConfig.createFromObject(d);
            } catch (error) {
                console.warn('Opzione ignorata per errore:', d, error);
                return null;
            }
        }).filter((d) => d !== null);

        return config;
    }

    static findTableConfig(tableId: string, groups: TableConfigGroup[]): TableConfig | undefined {        
        return groups
            .map((g: TableConfigGroup) => g.getTableConfig(tableId))
            .find((g) => g !== undefined)
    }

    public getTableConfig(id: string): TableConfig | undefined {
        return this.options.find((o: TableConfig) => o.id === id);
    }
}