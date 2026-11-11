import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { HttpContext } from '@angular/common/http';
import { SKIP_SPINNER } from '../../../interceptors/spinner-context';
@Injectable({
  providedIn: 'root',
})
export class Posts {


  private readonly httpClient = inject(HttpClient)


  allPosts(): Observable<any> {
    return this.httpClient.get(`${environment.paseurl}/posts`, {
      context: new HttpContext().set(SKIP_SPINNER, true)
    });
  }
  like_unlikePost(postId: string): Observable<any> {
    return this.httpClient.put(`${environment.paseurl}/posts/${postId}/like`, {})
  }
  sharePost(postId: string, body: {}): Observable<any> {
    return this.httpClient.post(`${environment.paseurl}/posts/${postId}/share`, body)
  }

  createPost(body: object | FormData): Observable<any> {
    return this.httpClient.post(`${environment.paseurl}/posts`, body);
  }

  updatePost(postId: string, body: object | FormData): Observable<any> {
    return this.httpClient.put(`${environment.paseurl}/posts/${postId}`, body);
  }

  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete(`${environment.paseurl}/posts/${postId}`, {
      context: new HttpContext().set(SKIP_SPINNER, true)
    })
  }
  bookmarkPost(postId: string): Observable<any> {
    return this.httpClient.put(`${environment.paseurl}/posts/${postId}/bookmark`, {})
  }
  singlePost(postId: string): Observable<any> {
    return this.httpClient.get(`${environment.paseurl}/posts/${postId}`)
  }
  getPostsLike(postId: string) {
    return this.httpClient.get(`${environment.paseurl}/posts/${postId}/likes?page=1&limit=20`,)
  }
  getUserPosts(userId: string): Observable<any> {
    return this.httpClient.get(`${environment.paseurl}/users/${userId}/posts`, {
      context: new HttpContext().set(SKIP_SPINNER, true)
    })
  }
  getSavedPosts(): Observable<any> {
    return this.httpClient.get(`${environment.paseurl}/users/bookmarks`, {
      context: new HttpContext().set(SKIP_SPINNER, true)
    })
  }
  getHomeFeed() {
    return this.httpClient.get(`${environment.paseurl}/posts/feed?only=following&limit=10`)
  }
  getFollowingsSuggestions(limit: number = 10, page: number = 1) {
    const params = new HttpParams()
      .set('limit', limit)
      .set('page', page);

    return this.httpClient.get(
      `${environment.paseurl}/users/suggestions`,
      { params }
    );
  }
  follow_unfollowUser(userId: string) {
    return this.httpClient.put(`${environment.paseurl}/users/${userId}/follow`, {}, {
      context: new HttpContext().set(SKIP_SPINNER, true)
    })
  }
}
