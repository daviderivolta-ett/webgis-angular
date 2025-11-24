export class Settings {
    public mapTimeSpan: number = 60;
    public staleDataThreshold: number = 60;

    constructor() { }

    static createFromObject(object: any): Settings {   
        const settings: Settings = new Settings();

        settings.mapTimeSpan = object['mapTimeSpan'] && typeof object['mapTimeSpan'] === 'number' ? object['mapTimeSpan'] : 60;
        settings.staleDataThreshold = object['staleDataThreshold'] && typeof object['staleDataThreshold'] === 'number' ? object['staleDataThreshold'] : 60;

        return settings;
    }
}