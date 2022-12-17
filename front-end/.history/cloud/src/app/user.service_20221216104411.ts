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
    return this.http.get("http://127.0.0.1:5000/api/v1.0/user/status")
  }
  getUserInfo(id?: string) {
    if (!id) {
      id = this.getId()!
    }
    return this.http.get("http://127.0.0.1:5000/api/v1.0/user/" + id + "/info")
  }
  getUserFavorites(id?: string) {
    if (!id) {
      id = this.getId()!
    }
    return this.http.get("http://127.0.0.1:5000/api/v1.0/user/" + id + "/favorites")
  }
  getUserFollows(id?: string) {
    if (!id) {
      id = this.getId()!
    }
    return this.http.get("http://127.0.0.1:5000/api/v1.0/user/" + id + "/follows")
  }
  getUserJWT() {
    return localStorage.getItem("access_token") || "";
  }
  login(user: User) {
    let formData = new FormData()
    formData.append("username", user.username)
    formData.append("password", user.password)
    return this.http.post("http://127.0.0.1:5000/api/v1.0/login", formData)
  }
  signup(user: User) {
    let formData = new FormData()
    formData.append("username", user.username)
    formData.append("password", user.password)
    return this.http.post("http://127.0.0.1:5000/api/v1.0/register", formData)
  }
  setId(id: string) {
    localStorage.setItem("userid", id)
  }
  getId() {
    return localStorage.getItem("userid")
  }
  setUserJwt(jwt: string) {
    localStorage.setItem("access_token", jwt)
  }
  setUserName(name: string) {
    localStorage.setItem("name", name)
  }
  getUserName() {
    return localStorage.getItem("name")
  }
  logout() {
    return this.http.get("http://127.0.0.1:5000/api/v1.0/logout")
  }
  removeFavorite(video_id: string) {
    return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/favorite`, {})
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
