import { StationBase } from './station-base.class'
import { StationData } from './station-data.interface'
import { Sensor } from './sensor.class'

export class Station extends StationBase implements StationData {
    public value: number;
    public label?: string;
    public unit?: string;
    public date?: Date;

    constructor(
        id: string,
        lat: number,
        lng: number,
        sensors: Sensor[],
        value: number,
        name?: string,
        city?: string,
        alt?: number,
        label?: string,
        unit?: string,
        date?: Date
    ) {
        super(id, lat, lng, sensors, name, city, alt);

        this.value = value;
        this.label = label;
        this.unit = unit;
        this.date = date;
    }

    static override createDefault(): Station {
        return new Station('', 0, 0, [], 0);
    }

    static createStationDataFromGeoJSONProps(props: any): StationData {
        if (!('value' in props) || typeof props['value'] !== 'number') {
            throw new Error('Oggetto non valido: \'value\' mancante.');
        }

        const data: StationData = { value: 0 };

        if (props['layerLabel'] && typeof props['layerLabel'] === 'string') data.label = props['layerLabel'];
        if (props['unit'] && typeof props['unit'] === 'string') data.unit = props['unit'];
        if (props['refDate'] && typeof props['refDate'] === 'string') {
            const date = new Date(props['refDate']);
            if (!isNaN(date.getTime())) data.date = date;
        }

        return data;
    }

    static fromStationData(stationBase: StationBase, data: StationData): Station {
        const { value, label, unit, date } = data;

        return new Station(
            stationBase.id,
            stationBase.lat,
            stationBase.lng,
            stationBase.sensors,
            value,
            stationBase.name,
            stationBase.city,
            stationBase.alt,
            label,
            unit,
            date
        )
    }
}