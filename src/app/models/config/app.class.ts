export class AppConfig {
    public mapConfigUri: string = '';
    public colorScalesUri: string = '';
    public baseLayersUri: string = '';
    public infoLayersUri: string = ''
    public dataLayersUri: string = '';
    public layerCategoriesUri: string = '';
    public apiConfigUri: string = '';
    public tablesConfigUri: string = '';
    public radarConfigUri: string = '';
    public stationsConfigUri: string = '';
    public stationsPopupConfigUri: string = '';
    public sensorTypesUri: string = '';
    public settingsConfigUri: string = '';

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
        config.baseLayersUri = _get<string>(object['baseLayersUri'], '');
        config.infoLayersUri = _get<string>(object['infoLayersUri'], '');
        config.dataLayersUri = _get<string>(object['dataLayersUri'], '');
        config.layerCategoriesUri = _get<string>(object['layerCategoriesUri'], '');
        config.apiConfigUri = _get<string>(object['apiConfigUri'], '');
        config.tablesConfigUri = _get<string>(object['tablesConfigUri'], '');
        config.radarConfigUri = _get<string>(object['radarConfigUri'], '');
        config.stationsConfigUri = _get<string>(object['stationsConfigUri'], '');
        config.stationsPopupConfigUri = _get<string>(object['stationsPopupConfigUri'], '');
        config.sensorTypesUri = _get<string>(object['sensorTypesConfigUri'], '');
        config.settingsConfigUri = _get<string>(object['settingsConfigUri'], '');
     
        return config;
    }
}