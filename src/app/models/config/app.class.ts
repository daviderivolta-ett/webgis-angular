export class AppConfig {
    public mapConfigUri: string = '';
    public colorScalesUri: string = '';
    public apiConfigUri: string = '';
    public stationsConfigUri: string = '';

    private constructor() { }

    static createAppConfig(): AppConfig {
        return new AppConfig();
    }

    static createFromObject(object: any): AppConfig {
        const config = AppConfig.createAppConfig();

        function _get<T>(value: any, fallback: T): T {
            return (value !== undefined && value !== null) ? value : fallback;
        }

        config.mapConfigUri = _get<string>(object['mapConfigUri'], '');
        config.colorScalesUri = _get<string>(object['colorScalesUri'], '');
        config.apiConfigUri = _get<string>(object['apiConfigUri'], '');
        config.stationsConfigUri = _get<string>(object['stationsConfigUri'], '');
     
        return config;
    }
}