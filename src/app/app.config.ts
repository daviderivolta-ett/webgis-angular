/** Dependencies */
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';

/** Routes */
import { routes } from './app.routes';

/** Services */
import { ConfigService } from './services/config.service';
import { AuthService } from './services';

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
      const authService = inject(AuthService);

      await authService.configureAuth();
      await configService.getAppConfig();
      await configService.getApis();
    })
  ]
};
