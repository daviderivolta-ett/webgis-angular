/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { TableConfigGroup } from '../models'

/* Services */
import { ApiService, Auth2Service, ConfigService } from '../services'

/* Resolver */
export const tableConfigGroupsResolver: ResolveFn<TableConfigGroup[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: Auth2Service = inject(Auth2Service);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('tables')}`;

  return configService.getTableConfigGroups(url, authService.getAccessToken())
    .then((groups: TableConfigGroup[]) => groups)
    .catch((err: unknown) => {
      console.error(err);
      return [];
    })
};
