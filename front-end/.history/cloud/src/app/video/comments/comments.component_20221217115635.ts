import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user.service';
import { ret, Video, _Comment } from 'src/app/video';
import { VideoService } from 'src/app/video.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.less']
})
export class CommentsComponent {
  @Input() video_info!: Video
  @Input() comment!: _Comment
  @Input() parent_comment_id!: string
  @Input() is_sub_comment = false
  @Input() template!: any;
  @Output() send_new_comment_event = new EventEmitter()
  @Input() is_main_comment = true
  showComment: boolean = false
  constructor(private video: VideoService, private router: Router, private user: UserService, private fb: FormBuilder, private _user: UserService) { }
  commentForm = this.fb.nonNullable.group({
    comment: ['', [Validators.required, Validators.minLength(1)]],
  })
  getCurrentUserId() {
    return this.user.id
  }
  send() {
    if (this.commentForm.status == "VALID") {
      this.video.add_comment(this.commentForm.value.comment!, this.video_info._id, this.is_main_comment, this.is_main_comment ? this.is_sub_comment ? this.parent_comment_id : this.comment._id : "").subscribe(val => {
        // 发送成功了就向父元素发送事件
        this.video.openSnackBar("Send success!")
        this.send_new_comment_event.emit()
        this.showComment = false
      }, error => {
        this.showComment = false
        let _status = (error as HttpErrorResponse).status
        if (_status == 404) {
          this.video.openSnackBar("Comment no longer exists")
          setTimeout(() => {
            this.router.navigate(['/index'])
          }, 1000)
        } else if (_status == 401) {
          this.video.openSnackBar("Please login")
          setTimeout(() => {
            this.router.navigate(['/user/login', { url: this.router.url }])
          }, 1000)
        }
      })

    }
  }
  deleteComment() {
    this.video.delete_comment(this.video_info._id, this.is_sub_comment ? this.parent_comment_id : this.comment._id, this.is_sub_comment, this.is_sub_comment ? this.comment._id : "").subscribe(val => {
      this.video.openSnackBar("Delete success!")
      this.send_new_comment_event.emit()
    }, error => {
      let _status = (error as HttpErrorResponse).status
      if (_status == 404) {
        this.video.openSnackBar("Comment no longer exists")
        setTimeout(() => {
          this.router.navigate(['/index'])
        }, 1000)
      } else if (_status == 401) {
        this.video.openSnackBar("Please login")
        setTimeout(() => {
          this.router.navigate(['/user/login', { url: this.router.url }])
        }, 1000)
      }
    })
  }
}
