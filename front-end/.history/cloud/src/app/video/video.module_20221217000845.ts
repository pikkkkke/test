import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoRoutingModule } from './video-routing.module';
import { CommentsComponent } from './comments/comments.component';
import { InfoComponent } from './info/info.component';
import { MainComponent } from './main/main.component';


@NgModule({
  declarations: [
    CommentsComponent,
    InfoComponent,
    MainComponent
  ],
  imports: [
    CommonModule,
    VideoRoutingModule
  ]
})
export class VideoModule { }
