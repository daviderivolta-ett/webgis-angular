import { StationBase } from './station-base.class';

export type StationPopupConfig = {
    [K in keyof Omit<StationBase, 'sensors'>]: boolean;
};

export function createDefaultStationsPopupConfig(): StationPopupConfig {
    const emptyStation: StationBase = {} as StationBase;
    const excludedKeys = new Set(['sensors']);

    const config = Object.fromEntries(
        Object.keys(emptyStation)
            .filter((key) => !excludedKeys.has(key))
            .map((key) => [key, false])
    )

    return config as StationPopupConfig;
}