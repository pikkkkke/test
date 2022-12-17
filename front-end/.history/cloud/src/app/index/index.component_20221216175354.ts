import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { pageInfo, Video } from '../video';
import { VideoService } from '../video.service';
import { userinfo } from '../user';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.less']
})
export class IndexComponent implements OnInit, OnDestroy {
  getVideos!: Subscription;
  video_list: Video[] = []
  total_size!: string
  isAdmin = false
  filter_category: string = 'title'
  pageInfo: pageInfo = {
    page_num: 1,
    page_size: 10
  }

  searchForm = this.fb.nonNullable.group({
    search_content: ['', [Validators.required, Validators.minLength(1)]]

  })
  constructor(private user: UserService, private video_service: VideoService, private route: ActivatedRoute, private fb: FormBuilder, private router: Router) { }
  ngOnDestroy(): void {
    this.getVideos.unsubscribe()
  }
  ngOnInit(): void {
    this.getVideos = this.video_service.getVideos(this.pageInfo).subscribe(val => this.parseVideo(val), error => {
    })
    let ret = this.user.userIdentity == "admin"
    if (ret == false) {
      this.isAdmin = false
    } else {
      this.isAdmin = true
    }
  }
  parseVideo(info: any) {
    console.log("parse")
    // this.total_size = info[1].counts
    this.video_list = info
    console.log(this.video_list)
    console.log(this.video_list)
  }
  page_change(event: any) {
    console.log(event)
    this.pageInfo.page_num = event.pageIndex + 1
    this.pageInfo.page_size = event.pageSize
    this.getVideos.unsubscribe()
    this.getVideos = this.video_service.getVideos(this.pageInfo).subscribe(val => this.parseVideo(val), error => {

    })
  }
  search() {
    if (this.searchForm.status == "VALID") {
      let content = this.searchForm.value.search_content
      console.log(content)
      this.getVideos = this.video_service.getVideoByFilter(this.filter_category, content!, this.pageInfo).subscribe(val => this.parseVideo(val))
    }
  }
  deleteVideo(id: string) {
    console.log("delete");
    this.video_service.deleteVideo(id).subscribe(val => {
      this.video_service.openSnackBar("Delete success")
      this.getVideos = this.video_service.getVideos(this.pageInfo).subscribe(val => this.parseVideo(val))
    }, error => {
      let _status = (error as HttpErrorResponse).status
      if (_status == 404) {
        this.video_service.openSnackBar("Video no longer exists")
        setTimeout(() => {
          this.router.navigate(['/index'])
        }, 1000)
      } else if (_status == 401) {
        this.video_service.openSnackBar("No permission")
      }
    })
  }

}
