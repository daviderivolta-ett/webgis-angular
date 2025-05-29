import { AppConfigUrls } from './urls.interface';

export class AppConfig {
    private constructor(
        public urls: AppConfigUrls
    ){}

    static createAppConfig(urls: AppConfigUrls): AppConfig {
        return new AppConfig(urls);
    }

    static createDefaultAppConfig(): AppConfig {
        return new AppConfig({
            base: '',
            infoLayers: '',
            stations: ''
        });
    }

    static createFromObject(object: any): AppConfig {
        const config = AppConfig.createDefaultAppConfig();

        if ('urls' in object && typeof object === 'object') {
          const urls: any = { ...object['urls'] };
          if ('base' in urls && typeof urls['base'] === 'string') config.urls.base = urls['base'];
          if ('infoLayers' in urls && typeof urls['infoLayers'] === 'string') config.urls.infoLayers = urls['infoLayers'];
          if ('stations' in urls && typeof urls['stations'] === 'string') config.urls.stations = urls['stations'];
        }
    
        return config;
    }
}