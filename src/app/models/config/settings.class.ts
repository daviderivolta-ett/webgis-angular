export class Settings {
    public mapTimeSpan: number = 60;
    public staleDataThreshold: number = 60;
    public layerDataThreshold: number = 1440;

    constructor() { }

    static createFromObject(object: any): Settings {   
        const settings: Settings = new Settings();

        settings.mapTimeSpan = object['mapTimeSpan'] && typeof object['mapTimeSpan'] === 'number' ? object['mapTimeSpan'] : 60;
        settings.staleDataThreshold = object['staleDataThreshold'] && typeof object['staleDataThreshold'] === 'number' ? object['staleDataThreshold'] : 60;
        settings.layerDataThreshold = object['layerDataThreshold'] && typeof object['layerDataThreshold'] === 'number' ? object['layerDataThreshold'] : 1440;

        return settings;
    }
}