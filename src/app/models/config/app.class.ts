import { AppConfigUrls } from './urls.interface';

// export interface AppConfig {
//     urls: AppConfigUrls;
// }

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
}