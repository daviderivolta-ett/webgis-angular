export class MapConfig {
    public position: [number, number] = [0, 0];
    public zoom: number = 0;
    public maxBounds: [number, number][] = [[0, 0], [0, 0]];

    constructor() { }

    static createFromObject(object: any): MapConfig {
        const config = new MapConfig();

        config.position = (object['position'] && Array.isArray(object['position']) && object['position'].length === 2) ?
            [object['position'][0], object['position'][1]] :
            [0, 0];
        config.zoom = (object['zoom'] && typeof object['zoom'] === 'number') ? object['zoom'] : 0;
        config.maxBounds = (object['maxBounds'] && Array.isArray(object['maxBounds']) && object['maxBounds'].every((v: any) => Array.isArray(v) && v.length === 2)) ? [...object['maxBounds']] : [[0, 0], [0, 0]];

        return config;
    }
}