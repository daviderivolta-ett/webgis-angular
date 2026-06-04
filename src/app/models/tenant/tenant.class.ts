export class Tenant {
    public id: string;
    public label?: string;
    public fromDate: string;
    public toDate: string;
    public isLoaded: boolean;
    public isEnabled: boolean;

    constructor(id: string, fromDate: string, toDate: string, isLoaded: boolean, isEnabled: boolean, label?: string) {
        this.id = id;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.isLoaded = isLoaded;
        this.isEnabled = isEnabled;
        this.label = label;
    }

    static createFromObject(object: any): Tenant {
        if (!('id' in object) || typeof object['id'] !== 'string') throw new Error(`Oggetto non valido: 'id' mancante.`);
        if (!('fromDate' in object) || typeof object['fromDate'] !== 'string') throw new Error(`Oggetto non valido: 'fromDate' mancante.`);
        if (!('toDate' in object) || typeof object['toDate'] !== 'string') throw new Error(`Oggetto non valido: 'toDate' mancante.`);
        if (!('loaded' in object) || typeof object['loaded'] !== 'boolean') throw new Error(`Oggetto non valido: 'loaded' mancante.`);
        if (!('enabled' in object) || typeof object['enabled'] !== 'boolean') throw new Error(`Oggetto non valido: 'enabled' mancante.`);

        return new Tenant(object['id'], object['fromDate'], object['toDate'], object['loaded'], object['enabled'], object['name']);
    }
}