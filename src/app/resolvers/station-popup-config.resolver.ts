// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Services
import { ApiService, AuthService, ConfigService, TenantsService } from '../services';

export const stationPopupConfigResolver: ResolveFn<Map<string, string>> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const tenantsService: TenantsService = inject(TenantsService);
  const apiService: ApiService = inject(ApiService);

  const bridgeUri: string = apiService.replaceApiUrlPlaceholder(apiService.apis().get('retentionBridge') ?? '', tenantsService.selectedTenant()?.id ?? '');
  const url = tenantsService.selectedTenant() ?
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${bridgeUri}${apiService.apis().get('stationsPopup')}` :
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('stationsPopup')}`;


  return configService.getStationsPopupConfig(url, authService.getAccessToken())
    .then((data) => data)
    .catch((err: any) => {
      console.error(err);
      return new Map();
    });
};
