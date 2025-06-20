export class TablesConfig {
    filterKeys: string[] = [];

    constructor() { }

    static createFromObject(object: any): TablesConfig {
        const config = new TablesConfig();

        function _get<T>(value: any, fallback: T): T {
            return (value !== undefined && value !== null) ? value : fallback;
        }

        config.filterKeys = _get<string[]>(object['filterKeys'], []);

        return config;
    }
}