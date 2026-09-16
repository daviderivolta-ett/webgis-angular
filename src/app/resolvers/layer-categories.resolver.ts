/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { LayerCategory } from '../models'

/* Services */
import { ApiService, Auth2Service, ConfigService } from '../services'

/* Resolver */
export const layerCategoriesResolver: ResolveFn<LayerCategory[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: Auth2Service = inject(Auth2Service);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('layerCategories')}`;

  return configService.getLayerCategories(url, authService.getAccessToken())
    .then((data: LayerCategory[]) => data)
    .catch((err: unknown) => {
      console.error(err);
      return []
    });
};
