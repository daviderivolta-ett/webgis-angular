import { StationBase } from './station-base.class'
import { StationData } from './station-data.interface'
import { Sensor } from './sensor.class'
import { StationCreekThreshold } from './station-creek.interface'

export class Station extends StationBase implements StationData {
    public value: number;
    public parameter: string;
    public label?: string;
    public unit?: string;
    public date?: Date;
    public commt?: string;
    public subfolder?: string;

    constructor(
        id: string,
        lat: number,
        lng: number,
        sensors: Sensor[],
        value: number,
        parameter: string,
        uuid?: string,
        name?: string,
        city?: string,
        alt?: number,
        label?: string,
        unit?: string,
        date?: Date,
        commt?: string,
        subfolder?: string,
        type: 'platform' | 'lightning' | 'hydro' | 'wms' = 'platform',
        creekThreshold?: StationCreekThreshold
    ) {
        super(id, lat, lng, sensors, uuid, name, city, alt, type, creekThreshold);

        this.value = value;
        this.parameter = parameter;
        this.label = label;
        this.unit = unit;
        this.date = date;
        this.commt = commt;
        this.subfolder = subfolder;
        this.type = type;
        this.creekThreshold = creekThreshold;
    }

    static override createDefault(): Station {
        return new Station('', 0, 0, [], 0, '');
    }

    static createStationDataFromGeoJSONProps(props: any): StationData {
        if (
            (!('value' in props) || typeof props['value'] !== 'number') &&
            (!('intensity' in props) || typeof props['intensity'] !== 'number')
        ) {
            throw new Error('Oggetto non valido: \'value\' o \'intensity\' mancanti.');
        }

        const data: StationData = { value: 0, parameter: '' };

        if (
            (props['value'] && typeof props['value'] === 'number') ||
            (props['intensity'] && typeof props['intensity'] === 'number')
        ) {
            data.value =
                typeof props.value === 'number'
                    ? props.value
                    : Math.abs(props.intensity);
        }

        if (props['parameter'] && typeof props['parameter'] === 'string') data.parameter = props['parameter'];
        if (props['layerLabel'] && typeof props['layerLabel'] === 'string') data.label = props['layerLabel'];
        if (props['unit'] && typeof props['unit'] === 'string') data.unit = props['unit'];
        if (
            (('refDate' in props) && typeof props['refDate'] === 'string') ||
            (('referenceDate' in props) && typeof props['referenceDate'] == 'string') ||
            (('creationDate' in props) && typeof props['creationDate'] == 'string')
        ) {
            const rawDate =
                typeof props.refDate === 'string' ? props.refDate :
                    typeof props.referenceDate === 'string' ? props.referenceDate :
                        props.creationDate;

            const date = new Date(rawDate);
            if (!isNaN(date.getTime())) data.date = date;
        }
        if (props['commt'] && typeof props['commt'] === 'string') data.commt = props['commt'];
        if (props['subFolder'] && typeof props['subFolder'] === 'string') data.subfolder = props['subFolder'];
        return data;
    }

    static fromStationData(stationBase: StationBase, data: StationData): Station {
        const { value, parameter, label, unit, date, commt, subfolder } = data;

        return new Station(
            stationBase.id,
            stationBase.lat,
            stationBase.lng,
            stationBase.sensors,
            value,
            parameter,
            stationBase.uuid,
            stationBase.name,
            stationBase.city,
            stationBase.alt,
            label,
            unit,
            date,
            commt,
            subfolder,
            stationBase.type,
            stationBase.creekThreshold
        )
    }

    public addSensorsFromStationLists(stations: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[]): Station {
        const station: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'> | undefined = stations.find((s: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>) => s.id === this.id);
        if (station) this.sensors = [...station.sensors];
        return this;
    }

    static fromStationPick(stationPick: Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>): Station {
        const stationBase = new StationBase(stationPick.id, 0, 0, stationPick.sensors, undefined, stationPick.name);
        return Station.fromStationData(stationBase, { value: 0, parameter: '' });
    }
}