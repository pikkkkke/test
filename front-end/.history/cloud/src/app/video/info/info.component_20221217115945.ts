import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UserService } from 'src/app/user.service';
import { ret, Video } from 'src/app/video';
import { VideoService } from 'src/app/video.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.less']
})

export class InfoComponent implements OnInit, OnDestroy {
  @Input() video_id!: string
  openDescription = false;
  showComments = true
  @Input() video_info!: Video
  @Output() sendNewComment = new EventEmitter()
  isInfavorite = false
  constructor(private video: VideoService, private router: Router, private user: UserService, private fb: FormBuilder, private route: ActivatedRoute) { }
  ngOnInit(): void {
    console.log(this.video_info)

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.user.isInFavorite(paramMap.get("id")!).subscribe(val => {
        console.log(val)
        this.isInfavorite = true
      }, error => {
        console.log(error)
        this.isInfavorite = false
        return true
      })
    })
  }
  ngOnDestroy(): void {

  }
  onnewcomment() {
    this.sendNewComment.emit()
  }
  addFavorite() {
    this.video.add_to_favorites(this.video_info._id).subscribe(val => {
      let message = (val as ret).message
      if (message == "add to favorite") {
        this.isInfavorite = true
      } else {
        this.isInfavorite = false
      }
    })
  }
  commentForm = this.fb.nonNullable.group({
    comment: ['', [Validators.required, Validators.minLength(1)]],
  })
  sendCommit(content: string) {
    if (this.commentForm.status == "VALID") {
      this.video.add_comment(this.commentForm.value.comment!, this.video_info._id, false).subscribe(val => {
        // 发送成功了就向父元素发送事件
        this.video.openSnackBar("Send success!")
        this.sendNewComment.emit()
      }, error => {
        let _status = (error as HttpErrorResponse).status
        if (_status == 404) {
          this.video.openSnackBar("Video no longer exists")
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
}
