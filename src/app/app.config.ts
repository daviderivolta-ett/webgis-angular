// Libraries
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, of } from 'rxjs';

// Routes
import { routes } from './app.routes';

// Services
import { ConfigService } from './services/config.service';
import { AppConfig } from './models';

// Config
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      return firstValueFrom(
        configService.getAppConfig()
          .pipe(
            catchError((err) => {
              console.error(err);
              return of(AppConfig.createDefaultAppConfig())
            })
          )
      )
    })
  ]
};
