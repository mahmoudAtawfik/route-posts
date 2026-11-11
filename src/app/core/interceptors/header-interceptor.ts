import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  let clonedReq = req;
  if (token) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (!(req.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    clonedReq = req.clone({ setHeaders: headers });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('socialUser');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};