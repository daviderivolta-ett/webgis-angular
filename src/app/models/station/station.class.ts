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

        if (props['value'] && typeof props['value'] === 'number') data.value = props['value'];
        if (props['layerLabel'] && typeof props['layerLabel'] === 'string') data.label = props['layerLabel'];
        if (props['unit'] && typeof props['unit'] === 'string') data.unit = props['unit'];
        if (
            (('refDate' in props) && typeof props['refDate'] === 'string') ||
            (('referenceDate' in props) && typeof props['referenceDate'] == 'string')
        ) {
            const rawDate = typeof props['refDate'] === 'string' ?
                props['refDate'] :
                props['referenceDate'];

            const date = new Date(rawDate);
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

    public addSensorsFromStationLists(stations: StationBase[]): Station {
        const station: StationBase | undefined = stations.find((s: StationBase) => s.id === this.id);
        if (station) this.sensors = [...station.sensors];
        return this;
    }
}