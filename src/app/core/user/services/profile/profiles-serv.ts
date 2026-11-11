import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment'; 


@Injectable({
  providedIn: 'root',
})
export class ProfilesServ {
httpClient= inject(HttpClient)
myPhoto = signal<string>('');
getMyProfile():Observable<any>{
 return this.httpClient.get(`${environment.paseurl}/users/profile-data`)
}
uploadProfilePhoto(body:any):Observable<any>{
 return this.httpClient.put(`${environment.paseurl}/users/upload-photo`,body)
}
getUserProfile(userId:string):Observable<any>{
 return this.httpClient.get(`${environment.paseurl}/users/${userId}/profile`)
}
changePassword(body:any):Observable<any>{
 return this.httpClient.patch(`${environment.paseurl}/users/change-password`,body)
}

}
