// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { SensorType } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const sensorTypesResolver: ResolveFn<SensorType[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getSensorTypesConfig()
    .then((data: SensorType[]) => data)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};