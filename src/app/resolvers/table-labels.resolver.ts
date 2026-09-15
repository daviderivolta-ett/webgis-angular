/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Services */
import { ApiService, AuthService, ConfigService, TenantsService } from '../services'

/* Resolver */
export const tableLabelsResolver: ResolveFn<Map<string, string>> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const tenantsService: TenantsService = inject(TenantsService);
  const apiService: ApiService = inject(ApiService);

  const bridgeUri: string = apiService.replaceApiUrlPlaceholder(apiService.apis().get('retentionBridge') ?? '', tenantsService.selectedTenant()?.id ?? '');
  const url = tenantsService.selectedTenant() ?
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${bridgeUri}${apiService.apis().get('tables')}` :
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('tables')}`;

  return configService.getTableLabels(url, authService.getAccessToken())
    .then((map: Map<string, string>) => map)
    .catch((err: unknown) => {
      console.error(err);
      return new Map();
    })
};
