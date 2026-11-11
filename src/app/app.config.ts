import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { headerInterceptor } from './core/interceptors/header-interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { spinnerInterceptor } from './core/interceptors/spinner-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes , withInMemoryScrolling({scrollPositionRestoration:"top"}) ),
    provideHttpClient(withFetch(), withInterceptors([headerInterceptor , spinnerInterceptor])),
    importProvidersFrom(NgxSpinnerModule) 
  ]
};
