import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SKIP_SPINNER } from '../../../interceptors/spinner-context';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly httpClient = inject(HttpClient)
  register(data: object
  ): Observable<any> {
    return this.httpClient.post(`${environment.paseurl}/users/signup`, data, {
      context: new HttpContext().set(SKIP_SPINNER, true)
    })
  }

  login(data: object): Observable<any> {
    return this.httpClient.post(`${environment.paseurl}/users/signin`, data, {
      context: new HttpContext().set(SKIP_SPINNER, true)
    })
  }


}
