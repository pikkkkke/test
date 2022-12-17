import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription, switchMap } from 'rxjs';
import { Video } from 'src/app/video';
import { VideoService } from 'src/app/video.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
  video_id: string = ''
  current_video!: Observable<any>
  constructor(private route: ActivatedRoute, private video: VideoService) { }
  ngOnInit(): void {
    this.current_video = this.route.paramMap.pipe(switchMap((param: ParamMap) => {
      return this.video.getVideo(param.get("id")!)
    }))
  }
  refreashlist() {
    this.current_video = this.route.paramMap.pipe(switchMap((param: ParamMap) => {
      return this.video.getVideo(param.get("id")!)
    }))
  }


}
