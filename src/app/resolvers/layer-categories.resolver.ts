/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { LayerCategory } from '../models'

/* Services */
import { ApiService, AuthService, ConfigService } from '../services'

/* Resolver */
export const layerCategoriesResolver: ResolveFn<LayerCategory[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('layerCategories')}`;

  return configService.getLayerCategories(url, authService.getAccessToken())
    .then((data: LayerCategory[]) => data)
    .catch((err: unknown) => {
      console.error(err);
      return []
    });
};
