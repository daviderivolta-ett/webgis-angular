// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { createDefaultStationsPopupConfig, StationPopupConfig } from '../models';

// Services
import { PopupService } from '../services';

export const stationPopupConfigResolver: ResolveFn<StationPopupConfig> = async (route, state) => {
  // const configService: ConfigService = inject(ConfigService);
  const popupService: PopupService = inject(PopupService);

  // return configService.getStationsPopupConfig()
  return popupService.getPopupConfig()
    .then((data: StationPopupConfig) => data)
    .catch((err: any) => {
      console.error(err);
      return createDefaultStationsPopupConfig();
    });
};
