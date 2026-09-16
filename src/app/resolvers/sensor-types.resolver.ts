/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { SensorType } from '../models'

/* Services */
import { ApiService, AuthService, ConfigService } from '../services'

/* Resolver */
export const sensorTypesResolver: ResolveFn<SensorType[]> = async () => {
  const configService: ConfigService = inject(ConfigService);
  const authService: AuthService = inject(AuthService);
  const apiService: ApiService = inject(ApiService);

  const url = `${apiService.apis().get('baseUrl')}${apiService.apis().get('stationsApi')}${apiService.apis().get('sensorTypes')}`;

  return configService.getSensorTypesConfig(url, authService.getAccessToken())
    .then((data: SensorType[]) => data)
    .catch((err: unknown) => {
      console.error(err);
      return []
    });
};