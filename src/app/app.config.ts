/** Dependencies */
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';

/** Routes */
import { routes } from './app.routes';

/** Models */
import { AppConfig } from './models';

/** Services */
import { ConfigService } from './services/config.service';

/** Config */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // provideRouter(routes, withHashLocation()),
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      return configService.getAppConfig()
        .catch((err: any) => {
          console.error(err);
          return AppConfig.createAppConfig()
        })
    })
  ]
};
