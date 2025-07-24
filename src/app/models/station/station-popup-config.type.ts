import { StationBase } from './station-base.class';
import { Station } from './station.class';

export type StationPopupConfig = {
    [K in keyof Omit<Station, 'sensors'>]: boolean;
};

export function createStationPopupConfigFromObject(object: any): StationPopupConfig {
    function _get<T>(value: any, fallback: T): T {
        return (value !== undefined && value !== null) ? value : fallback;
    }

    const emptyStation: Station = Station.createDefault();
    const excludedKeys = new Set(['sensors']);

    const config: { [key: string]: boolean } = {};
    (Object.keys(emptyStation) as (keyof Omit<Station, 'sensors'>)[])
        .filter((k) => !excludedKeys.has(k))
        .forEach(k => {
            const key = k as keyof StationBase;
            config[key] = _get(object[key], true);
        });

    return config as StationPopupConfig;
}

export function createDefaultStationsPopupConfig(): StationPopupConfig {
    const emptyStation: Station = Station.createDefault();
    const excludedKeys = new Set(['sensors']);

    const config = Object.fromEntries(
        Object.keys(emptyStation)
            .filter((key) => !excludedKeys.has(key))
            .map((key) => [key, true])
    )

    return config as StationPopupConfig;
}