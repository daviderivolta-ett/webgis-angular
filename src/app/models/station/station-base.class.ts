import { Sensor } from './sensor.class';
import { Geolocation } from '../geographic'

export class StationBase implements Geolocation {
    public id: string;
    public lat: number;
    public lng: number;
    public sensors: Sensor[];
    public name?: string;
    public city?: string;
    public alt?: number;

    constructor(
        id: string,
        lat: number,
        lng: number,
        sensors: Sensor[],
        name?: string,
        city?: string,
        alt?: number
    ) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.sensors = sensors;
        this.name = name;
        this.city = city;
        this.alt = alt;
    }

    static createDefault(): StationBase {
        return new StationBase('', 0, 0, []);
    }

    static createFromObject(object: any): StationBase {        
        if (!('id' in object) || typeof object['id'] !== 'string') {
            throw new Error('Oggetto non valido: \'id\' mancante.');
        }

        if (!('lat' in object) || typeof object['lat'] !== 'number') {
            throw new Error('Oggetto non valido: \'lat\' mancante.');
        }

        if (!('lng' in object) || typeof object['lng'] !== 'number') {
            throw new Error('Oggetto non valido: \'lng\' mancante.');
        }

        if (!('sensors' in object) || !Array.isArray(object['sensors'])) {
            throw new Error('Oggetto non valido: \'sensors\' mancante od invalido.');
        }

        const station = new StationBase(object['id'], object['lat'], object['lng'], object['sensors'].map((s: any) => Sensor.createFromObject(s)));

        if (object['name'] && typeof object['name'] === 'string') station.name = object['name'];
        if (object['city'] && typeof object['city'] === 'string') station.city = object['city'];
        if ('alt' in object && typeof object['alt'] === 'number') station.alt = object['alt'];

        return station;
    }

    static createFromGeoJSONProps(props: Record<string, any>): StationBase {
        if (!('shortCode' in props) || typeof props['shortCode'] !== 'string') {
            throw new Error('Oggetto non valido: \'shortCode\' mancante.');
        }

        if (!('lat' in props) || typeof props['lat'] !== 'number') {
            throw new Error('Oggetto non valido: \'lat\' mancante.');
        }

        if (!('lng' in props) || typeof props['lng'] !== 'number') {
            throw new Error('Oggetto non valido: \'lng\' mancante.');
        }

        // if (!('sensors' in props) || !Array.isArray(props['sensors'])) {
        //     throw new Error('Oggetto non valido: \'sensors\' mancante od invalido.');
        // }

        const station = new StationBase(props['shortCode'], props['lat'], props['lng'], []);

        if (props['name'] && typeof props['name'] === 'string') station.name = props['name'];
        if (props['municipality'] && typeof props['municipality'] === 'string') station.city = props['municipality'];
        if ('alt' in props && typeof props['alt'] === 'number') station.alt = props['alt'];

        return station;
    }
}