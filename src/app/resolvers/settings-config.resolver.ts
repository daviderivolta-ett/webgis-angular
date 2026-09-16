/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { Settings } from '../models'

/* Services */
import { ApiService, Auth2Service, ConfigService } from '../services'

/* Resolver */
export const settingsConfigResolver: ResolveFn<Settings> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: Auth2Service = inject(Auth2Service);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('settings')}`;

  return configService.getSettings(url, authService.getAccessToken())
    .then((settings: Settings) => settings)
    .catch((err: unknown) => {
      console.error(err);
      return new Settings()
    });
};