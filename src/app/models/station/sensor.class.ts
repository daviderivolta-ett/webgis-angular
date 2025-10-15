export class Sensor {
    public id: string;
    public type: string;
    public enabled: boolean;

    constructor(id: string, type: string, enabled: boolean) {
        this.id = id;
        this.type = type;
        this.enabled = enabled;
    }

    static createFromObject(object: any): Sensor {
        if (!('id' in object) || typeof object['id'] !== 'string') {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        if (!(('type' in object && typeof object['type'] === 'string') || ('name' in object && typeof object['name'] === 'string'))) {
            throw new Error("Oggetto non valido: 'type' o 'name' mancante.");
        }


        if (!('enabled' in object) || typeof object['enabled'] !== 'boolean') {
            throw new Error('Oggetto non valido: \'enabled\' mancante.');
        }

        return new Sensor(object['id'], object['type'] ?? object['name'], object['enabled']);
    }
}