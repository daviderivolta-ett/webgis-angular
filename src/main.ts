// Libraries
import { bootstrapApplication } from '@angular/platform-browser';

// Config
import { appConfig } from './app/app.config';

// Component
import { AppComponent } from './app/app.component';

// Bootstrap
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
