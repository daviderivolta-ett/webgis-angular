/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Services */
import { ApiService, Auth2Service, ConfigService } from '../services'

/* Resolver */
export const tableLabelsResolver: ResolveFn<Map<string, string>> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: Auth2Service = inject(Auth2Service);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('tables')}`;

  return configService.getTableLabels(url, authService.getAccessToken())
    .then((map: Map<string, string>) => map)
    .catch((err: unknown) => {
      console.error(err);
      return new Map();
    })
};
