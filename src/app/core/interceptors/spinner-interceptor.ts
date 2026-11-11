import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, finalize, throwError } from 'rxjs';
import { SKIP_SPINNER } from './spinner-context';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(NgxSpinnerService);
  const showSpinner = req.context.get(SKIP_SPINNER);

  if (showSpinner) {
    spinnerService.show('sample', {
      type: 'cog',
      size: 'medium',
      bdColor: 'transparent',
      color: '#1877f2',
      fullScreen: true,
      zIndex: 99999
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 0) {
        alert('No internet connection. Please check your connection and try again.');
      }

      return throwError(() => error);
    }),

    finalize(() => {
      if (showSpinner) {
        spinnerService.hide('sample');
      }
    })
  );
};