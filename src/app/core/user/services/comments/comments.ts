import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment'; 
@Injectable({
  providedIn: 'root',
})
export class Comments {
  httpClient=inject(HttpClient)
  
  getComments(postId: string): Observable<any> {
    return this.httpClient.get(`${environment.paseurl}/posts/${postId}/comments?page=1&limit=10`,);
  }
   getCommentsReplies(postId: string , commentId : string): Observable<any> {
    return this.httpClient.get(`${environment.paseurl}/posts/${postId}/comments/${commentId}/replies?page=1&limit=10`);
  }
  addcomment(postId: string, body: object | FormData): Observable<any> {
    return this.httpClient.post(`${environment.paseurl}/posts/${postId}/comments`, body);
  }
   createReply(postId: string, commentId: string, body: object | FormData): Observable<any> {
    return this.httpClient.post(`${environment.paseurl}/posts/${postId}/comments/${commentId}/replies`, body);
  }
  updateComment(postId: string, commentId: string, body: object | FormData): Observable<any> {
    return this.httpClient.put(`${environment.paseurl}/posts/${postId}/comments/${commentId}`, body);
  }
  deleteComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.delete(`${environment.paseurl}/posts/${postId}/comments/${commentId}`);
  }
  likeCommentunlike(postId: string, commentId: string): Observable<any> {
    return this.httpClient.put(`${environment.paseurl}/posts/${postId}/comments/${commentId}/like`, {});
  }
}
