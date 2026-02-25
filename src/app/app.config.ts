/** Dependencies */
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';

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
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    {
      provide: OAuthStorage,
      useFactory: () => localStorage
    },
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      return configService.getAppConfig()
        .catch((err: any) => {
          console.error(err);
          return AppConfig.createAppConfig()
        })
    })
  ]
};
