// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { createDefaultStationsPopupConfig, StationPopupConfig } from '../models';

// Services
import { ConfigService } from '../services';

export const stationPopupConfigResolver: ResolveFn<StationPopupConfig> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getStationsPopupConfig()
    .then((data: StationPopupConfig) => data)
    .catch((err: any) => {
      console.error(err);
      return createDefaultStationsPopupConfig();
    });
};
