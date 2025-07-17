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
        if (object['alt'] && typeof object['alt'] === 'number') station.alt = object['alt'];

        return station;
    }
}