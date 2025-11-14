// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { Settings } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const settingsConfigResolver: ResolveFn<Settings> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getSettings()
    .then((settings: Settings) => settings)
    .catch((err: any) => {
      console.error(err);
      return new Settings()
    });
};