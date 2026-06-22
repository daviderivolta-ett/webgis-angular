// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { LayerGroup } from '../models';

// Services
import { ApiService, AuthService, ConfigService, TenantsService } from '../services';

// Resolver
export const infoLayersResolver: ResolveFn<LayerGroup[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const tenantsService: TenantsService = inject(TenantsService);
  const apiService: ApiService = inject(ApiService);

  const bridgeUri: string = apiService.replaceApiUrlPlaceholder(apiService.apis().get('retentionBridge') ?? '', tenantsService.selectedTenant()?.id ?? '');
  const url = tenantsService.selectedTenant() ?
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${bridgeUri}${apiService.apis().get('infoLayers')}` :
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('infoLayers')}`;

  return configService.getInfoLayers(url, authService.getAccessToken())
    .then((data: LayerGroup[]) => data)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};