export class StationCreekThreshold {
    public yMin?: number;
    public yMax?: number;
    public sms?: number;
    public flood?: number;
    public orange?: number;
    public red?: number;
    public black?: number;
    public white?: number;

    static createFromObject(object: any): StationCreekThreshold {
        const creekThreshold: StationCreekThreshold = new StationCreekThreshold();

        if ('yMin' in object && typeof object['yMin'] === 'number') creekThreshold['yMin'] = object['yMin'];
        if ('yMax' in object && typeof object['yMax'] === 'number') creekThreshold['yMax'] = object['yMax'];
        if ('sms' in object && typeof object['sms'] === 'number') creekThreshold['sms'] = object['sms'];
        if ('flood' in object && typeof object['flood'] === 'number') creekThreshold['flood'] = object['flood'];
        if ('orange' in object && typeof object['orange'] === 'number') creekThreshold['orange'] = object['orange'];
        if ('red' in object && typeof object['red'] === 'number') creekThreshold['red'] = object['red'];
        if ('black' in object && typeof object['black'] === 'number') creekThreshold['black'] = object['black'];
        if ('white' in object && typeof object['white'] === 'number') creekThreshold['white'] = object['white'];

        creekThreshold.yMin = -1;
        creekThreshold.yMax = 6;
        creekThreshold.orange = 2.5;
        creekThreshold.red = 3.5;

        return creekThreshold;
    }
}