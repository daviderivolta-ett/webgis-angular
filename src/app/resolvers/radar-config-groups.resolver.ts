/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { RadarConfigGroup } from '../models/radar'

/* Services */
import { ApiService, AuthService, ConfigService, TenantsService } from '../services'

/* Resolver */
export const radarConfigGroupsResolver: ResolveFn<RadarConfigGroup[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const tenantsService: TenantsService = inject(TenantsService);
  const apiService: ApiService = inject(ApiService);

  const bridgeUri: string = apiService.replaceApiUrlPlaceholder(apiService.apis().get('retentionBridge') ?? '', tenantsService.selectedTenant()?.id ?? '');
  const url = tenantsService.selectedTenant() ?
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${bridgeUri}${apiService.apis().get('radar')}` :
    `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('radar')}`;

  return configService.getRadarConfigGroups(url, authService.getAccessToken())
    .then((groups: RadarConfigGroup[]) => groups)
    .catch((err: unknown) => {
      console.error(err);
      return [];
    })
};