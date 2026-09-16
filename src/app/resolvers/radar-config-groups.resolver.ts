/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { RadarConfigGroup } from '../models/radar'

/* Services */
import { ApiService, Auth2Service, ConfigService } from '../services'

/* Resolver */
export const radarConfigGroupsResolver: ResolveFn<RadarConfigGroup[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: Auth2Service = inject(Auth2Service);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('radar')}`;

  return configService.getRadarConfigGroups(url, authService.getAccessToken())
    .then((groups: RadarConfigGroup[]) => groups)
    .catch((err: unknown) => {
      console.error(err);
      return [];
    })
};