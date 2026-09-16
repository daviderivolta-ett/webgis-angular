/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { LayerGroup } from '../models'

/* Services */
import { ApiService, Auth2Service, ConfigService } from '../services'

/* Resolver */
export const infoLayersResolver: ResolveFn<LayerGroup[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: Auth2Service = inject(Auth2Service);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('infoLayers')}`;

  return configService.getInfoLayers(url, authService.getAccessToken())
    .then((data: LayerGroup[]) => data)
    .catch((err: unknown) => {
      console.error(err);
      return []
    });
};