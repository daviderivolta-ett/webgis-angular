/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { LayerGroup } from '../models'

/* Services */
import { ApiService, AuthService, ConfigService } from '../services'

/* Resolver */
export const baseLayersResolver: ResolveFn<LayerGroup[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const apiService: ApiService = inject(ApiService);
  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('baseLayers')}`;

  return configService.getBaseLayers(url, authService.getAccessToken())
    .then((data: LayerGroup[]) => data)
    .catch((err: unknown) => {
      console.error(err);
      return []
    });
};
