import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { pageInfo } from './video';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }
  getVideos(pageInfo: pageInfo) {
    return this.http.get(`http://127.0.0.1:5000/cloud/api/v1/video?pn=${pageInfo.page_num}&ps=${pageInfo.page_size}`);
  }
  getVideo(video_id: string) {
    return this.http.get(`http://127.0.0.1:5000/api/v1.0/videos/${video_id}`)
  }
  openSnackBar(info: string) {
    this._snackBar.open(info, 'OK', {
      horizontalPosition: "center",
      verticalPosition: "top",
      duration: 3000
    });
  }
  thumb_up(id: string) {
    return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${id}/like`, {})
  }
  thumb_down(id: string) {
    return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${id}/dislike`, {})
  }
  add_to_favorites(id: string) {
    return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${id}/favorite`, {})
  }
  comment_thumb_up(video_id: string, comment_id: string, is_reply: boolean, reply_id?: string) {
    if (is_reply) {
      return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments/${comment_id}/reply/${reply_id}/like`, {})
    } else {
      return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments/${comment_id}/like`, {})
    }
  }

  comment_thumb_down(video_id: string, comment_id: string, is_reply: boolean, reply_id?: string) {
    if (is_reply) {
      return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments/${comment_id}/reply/${reply_id}/dislike`, {})
    } else {
      return this.http.put(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments/${comment_id}/dislike`, {})
    }
  }
  add_comment(comment: string, video_id: string, is_reply: boolean, comment_id?: string) {
    let formData = new FormData()
    formData.append("comment", comment)
    if (is_reply) {
      return this.http.post(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments/${comment_id}/replies`, formData)
    } else {
      return this.http.post(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments`, formData)
    }
  }
  delete_comment(video_id: string, comment_id: string, is_reply: boolean, reply_id?: string) {
    if (!is_reply) {
      return this.http.delete(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments/${comment_id}`)
    } else {
      return this.http.delete(`http://127.0.0.1:5000/api/v1.0/video/${video_id}/comments/${comment_id}/replies/${reply_id}`, {})
    }
  }
  getVideoByFilter(category: string, content: string, pageInfo: pageInfo) {
    return this.http.get(`http://127.0.0.1:5000/cloud/api/v1/video?pn=${pageInfo.page_num}&ps=${pageInfo.page_size}&${category}=${content}`);
  }
  deleteVideo(id: string) {
    return this.http.delete(`http://127.0.0.1:5000/cloud/api/v1/video/${id}`)
  }

}
