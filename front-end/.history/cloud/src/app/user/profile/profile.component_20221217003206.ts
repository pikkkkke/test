import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { userinfo } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import { VideoService } from 'src/app/video.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less']
})
export class ProfileComponent {
  isCurrentUser = true
  showUploading = false
  sub!: Subscription;
  showFavorites = true
  nowUser = this.user.id
  constructor(private user: UserService, private route: ActivatedRoute, private video: VideoService) { }
  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params: ParamMap) => {
      // 必须是管理员或者up可以上传
      if (params.get("id") && params.get("id") != this.nowUser) {
        this.nowUser = params.get("id")!
        if (this.user.userIdentity == 'user') {
          // 若是普通用户且不是当前用户
          this.isCurrentUser = false
        }
      }
      // 除了普通用户都能上传
      this.showUploading = this.user.userIdentity != 'user'
    })

  }
  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }
}
