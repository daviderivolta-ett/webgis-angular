export class Sensor {
    public id: string;
    public type: string;
    public isVisible: boolean;

    constructor(id: string, type: string, isVisible: boolean) {
        this.id = id;
        this.type = type;
        this.isVisible = isVisible;
    }

    static createFromObject(object: any): Sensor {
        if (!('id' in object) || typeof object['id'] !== 'string') {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        if (!('type' in object) || typeof object['type'] !== 'string') {
            throw new Error('Oggetto non valido: \'type\' mancante.');
        }

        if (!('isVisible' in object) || typeof object['isVisible'] !== 'boolean') {
            throw new Error('Oggetto non valido: \'isVisible\' mancante.');
        }

        return new Sensor(object['id'], object['type'], object['isVisible']);
    }
}