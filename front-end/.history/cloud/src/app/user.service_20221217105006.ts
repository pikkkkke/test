import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, Subscriber, switchMap, timer } from 'rxjs';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  getUserStatus() {
    return this.http.get("http://127.0.0.1:5000/cloud/api/v1/status")
  }

  login(user: User) {
    let formData = new FormData()
    formData.append("username", user.username)
    formData.append("password", user.password)
    formData.append("email", user.email)
    return this.http.post("http://127.0.0.1:5000/cloud/api/v1/login", formData)
  }
  signup(user: User) {
    let formData = new FormData()
    formData.append("username", user.username)
    formData.append("password", user.password)
    formData.append("email", user.email)
    formData.append("confirm", user.confirm!)
    return this.http.post("http://127.0.0.1:5000/cloud/api/v1/register", formData)
  }
  // userid
  set id(id: string) {
    localStorage.setItem("userid", id)
  }
  get id(): string {
    return localStorage.getItem("userid") || ""
  }
  // user name
  set userName(name: string) {
    localStorage.setItem("name", name)
  }
  get userName(): string {
    return localStorage.getItem("name") || ""
  }
  // user identity
  set userIdentity(identity: String) {
    localStorage.setItem("identity", identity.valueOf())
  }
  get userIdentity(): String {
    return localStorage.getItem("identity") || ""
  }
  // jwt
  set jwt(jwt: string) {
    localStorage.setItem("access_token", jwt)
  }
  get jwt(): string {
    return localStorage.getItem("access_token") || "";
  }
  isInFavorite(video_id: string) {
    return this.http.get(`http://127.0.0.1:5000/cloud/api/v1/user/collections/${video_id}`)
  }
  logout() {
    return this.http.get("http://127.0.0.1:5000/api/v1.0/logout")
  }
  removeFavorite(video_id: string) {
    return this.http.put(`http://127.0.0.1:5000/cloud/api/v1/video/${video_id}/cancel`, {})
  }
  removeFollow(user_id: string) {
    return this.http.put(`http://127.0.0.1:5000/api/v1.0/user/${user_id}/follow`, {})
  }
  reviseUserInfo(name: string, email: string) {
    let formdata = new FormData()
    formdata.append("displayname", name)
    formdata.append("email", email)
    return this.http.put(`http://127.0.0.1:5000/api/v1.0/user/info`, formdata)
  }
}
