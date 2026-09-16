/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Services */
import { ApiService, AuthService, ConfigService } from '../services'

/* Resolver */
export const tableLabelsResolver: ResolveFn<Map<string, string>> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('tables')}`;

  return configService.getTableLabels(url, authService.getAccessToken())
    .then((map: Map<string, string>) => map)
    .catch((err: unknown) => {
      console.error(err);
      return new Map();
    })
};
