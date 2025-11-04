import { Sensor } from './sensor.class'
import { Geolocation } from '../geographic'

export class StationBase implements Geolocation {
    public id: string;
    public type: 'station' | 'lightning';
    public lat: number;
    public lng: number;
    public sensors: Sensor[];
    public uuid?: string;
    public name?: string;
    public city?: string;
    public alt?: number;

    constructor(
        id: string,
        lat: number,
        lng: number,
        sensors: Sensor[],
        uuid?: string,
        name?: string,
        city?: string,
        alt?: number,
        type: 'station' | 'lightning' = 'station'
    ) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.sensors = sensors;
        this.uuid = uuid;
        this.name = name;
        this.city = city;
        this.alt = alt;
        this.type = type;
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

    static createPartialFromObject(object: any): Pick<StationBase, 'id' | 'name' | 'uuid' | 'sensors'> {
        if (!('stationCode' in object) || typeof object['stationCode'] !== 'string') {
            throw new Error('Oggetto non valido: \'stationCode\' mancante.');
        }

        if (!('parameters' in object) || !Array.isArray(object['parameters'])) {
            throw new Error('Oggetto non valido: \'parameters\' mancante od invalido.');
        }

        const station: Pick<StationBase, 'id' | 'name' | 'uuid' | 'sensors'> = {
            id: object['stationCode'],
            name: object['stationName'],
            uuid: object['id'] ?? object['stationCode'],
            sensors: object['parameters'].map((s: any) => Sensor.createFromObject(s))
        }
        return station;
    }

    static createFromGeoJSONProps(props: Record<string, any>): StationBase {      
        if (
            (!('shortCode' in props) || typeof props['shortCode'] !== 'string') &&
            (!('stationCode' in props) || typeof props['stationCode'] !== 'string') &&
            (!('code' in props) || typeof props['code'] !== 'string')
        ) {
            throw new Error('Oggetto non valido: \'code\', \'shortCode\' o \'stationCode\' mancanti.');
        }

        if (!('lat' in props) || typeof props['lat'] !== 'number') {
            throw new Error('Oggetto non valido: \'lat\' mancante.');
        }

        if (!('lng' in props) || typeof props['lng'] !== 'number') {
            throw new Error('Oggetto non valido: \'lng\' mancante.');
        }

        const station = new StationBase(props['shortCode'] ?? props['stationCode'] ?? props['code'] ?? '', props['lat'], props['lng'], []);

        if (props['name'] && typeof props['name'] === 'string') station.name = props['name'];
        if (props['municipality'] && typeof props['municipality'] === 'string') station.city = props['municipality'];
        if ('alt' in props && typeof props['alt'] === 'number') station.alt = props['alt'];
        if ('type' in props && typeof props['type'] === 'string' && (props['type'] === 'station' || props['type'] === 'lightning')) station.type = props['type'];
      
        return station;
    }

    static fromPartialToDatabaseStationParameter(station: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>) {
        return {
            stationId: station.uuid,
            parameters: station.sensors.map((s: Sensor) => ({ id: s.id, newEnabledValue: s.enabled }))
        }
    }
}