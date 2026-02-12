// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Services
import { ConfigService } from '../services';

export const stationPopupConfigResolver: ResolveFn<Map<string, string>> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getStationsPopupConfig()
    .then((data) => data)
    .catch((err: any) => {
      console.error(err);
      return new Map();
    });
};
