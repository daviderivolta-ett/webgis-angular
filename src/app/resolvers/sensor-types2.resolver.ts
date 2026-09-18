/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Types */
import { SensorType2 } from '../models'

/* Models */
import { ApiService, ConfigService } from '../services'

/* Resolver */
export const sensorTypes2Resolver: ResolveFn<SensorType2[]> = async () => {
    const configService: ConfigService = inject(ConfigService);
    // const authService: Auth2Service = inject(Auth2Service);
    const apiService: ApiService = inject(ApiService);

    const url = `${apiService.apis().get('sensorTypes2')}`;

    return configService.getSensorTypes2Config(url)
        .then((data: SensorType2[]) => data)
        .catch((err: unknown) => {
            console.error(err);
            return []
        });
}