export class MapConfig {
    public position: [number, number] = [0, 0];
    public zoom: number = 0;
    public markerColors: Map<string, string> = new Map();

    constructor() { }

    static createFromObject(object: any): MapConfig {
        const config = new MapConfig();

        config.position = (object['position'] && Array.isArray(object['position']) && object['position'].length === 2) ?
            [object['position'][0], object['position'][1]] :
            [0, 0];
        config.zoom = (object['zoom'] && typeof object['zoom'] === 'number') ? object['zoom'] : 0
        config.markerColors = object['markerColors'] ?
            new Map(Object.entries(object['markerColors'])) :
            new Map();

        return config;
    }
}