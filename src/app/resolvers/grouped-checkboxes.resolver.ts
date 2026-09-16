/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { LayerGroup } from '../models'

/* Services */
import { ApiService, AuthService, ConfigService } from '../services'

/* Resolver */
export const groupedCheckboxesResolver: ResolveFn<LayerGroup[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('dataLayers')}`;

  return configService.getDataLayers(url, authService.getAccessToken())
    .then((config: LayerGroup[]) => config)
    .catch((err: unknown) => {
      console.error(err);
      return []
    })
};