import { StationBase } from './station-base.class'
import { StationData } from './station-data.interface'
import { Basin } from './basin-data.interface'

export class Station extends StationBase implements StationData {
    public value: number;
    public refTime?: Date;
    public updateTime?: Date;
    public basin?: Basin;

    constructor(
        id: string,
        lat: number,
        lng: number,
        value: number,
        name?: string,
        city?: string,
        alt?: number,
        refTime?: Date,
        updateTime?: Date,
        basin?: Basin
    ) {
        super(id, lat, lng, name, city, alt);

        this.value = value;
        this.refTime = refTime;
        this.updateTime = updateTime;
        this.basin = basin;
    }

    public addBasin(object: any): this {
        const hasBasinName: boolean = 'basin' in object && typeof object.basin === 'string';
        const hasBasinArea: boolean = 'basinArea' in object && typeof object.basinArea === 'number';
        const hasBasinClass: boolean = 'basinClass' in object && typeof object.basinClass === 'string';
        const hasRiverName: boolean = 'river' in object && typeof object.river === 'string';
        const hasWarningArea: boolean = 'warningArea' in object && typeof object.warningArea === 'string';

        if (hasBasinName && hasBasinArea && hasBasinClass && hasRiverName && hasWarningArea) {
            this.basin = {
                basinName: object.basin,
                basinArea: object.basinArea,
                basinClass: object.basinClass,
                riverName: object.river,
                warningArea: object.warningArea
            }
        }

        return this;
    }
}