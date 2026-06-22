// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { Settings } from '../models';

// Services
import { ApiService, AuthService, ConfigService, TenantsService } from '../services';

// Resolver
export const settingsConfigResolver: ResolveFn<Settings> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const tenantsService: TenantsService = inject(TenantsService);
  const apiService: ApiService = inject(ApiService);

  const bridgeUri: string = apiService.replaceApiUrlPlaceholder(apiService.apis().get('retentionBridge') ?? '', tenantsService.selectedTenant()?.id ?? '');
  const url = tenantsService.selectedTenant() ?
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${bridgeUri}${apiService.apis().get('settings')}` :
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('settings')}`;

  return configService.getSettings(url, authService.getAccessToken())
    .then((settings: Settings) => settings)
    .catch((err: any) => {
      console.error(err);
      return new Settings()
    });
};