import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VideoService } from 'src/app/video.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})
export class UploadComponent {
  showProgress = false
  showProgress_cover = false
  uploadForm = this._formBuilder.group({
    title: ['', Validators.required]
  })
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    publisher: ['', Validators.required],
    introduce: ['', Validators.required],
    genre: ['', Validators.required],
    producer: ['', Validators.required]
  });

  isUploaded = false;
  cover_isUploaded = false;
  isLinear = false;
  videoURL!: string | ArrayBuffer | null;
  imgURL!: string | ArrayBuffer;
  imgInfo!: any;
  fileChange(files: any) {
    // console.log(files.files);
    //  console.log(files.files.length);
    if (files.files.length === 0) {
      return;
    }

    setTimeout(() => {
      const reader = new FileReader();
      if (files.files[0].type == 'video/mp4') {
        reader.readAsDataURL(files.files[0]);
        reader.onload = () => {
          this.videoURL = reader.result;
          this.video.openSnackBar("Upload success");

        };
      }
    }, 2000)
  }
  upload($files: any) {


  }
  // 


  constructor(private _formBuilder: FormBuilder, private video: VideoService, private router: Router) { }

  file: any = undefined
  onFileDropped($event: any, type: number) {
    this.prepareFilesList($event, type);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any, type: number) {

    this.prepareFilesList(files, type);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile() {
    this.file = undefined
  }

  /**
   * Simulate the upload process
   */
  progress(type: number) {
    if (type == 0) {
      this.isUploaded = true
    } else {
      this.cover_isUploaded = true
    }


    this.showProgress = false
    this.showProgress_cover = false
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: any, type: number) {
    if (files.target.files.length === 0) {
      return;
    }
    if (type == 0) {
      // console.log(files.target)
    }
    if (type == 0) {
      this.showProgress = true
    } else {
      this.showProgress_cover = true
    }

    setTimeout(() => {
      const reader = new FileReader();
      reader.readAsDataURL(files.target.files[0]);
      this.uploadForm.setValue({ title: (files.target.files[0] as File).name })
      this.file = files.target.files[0]
      reader.onload = () => {
        if (type == 0) {
          this.videoURL = reader.result;

        } else {
          this.imgURL = reader.result!
        }
        this.progress(type)
      };
    }, 0)

  }
  onSubmit() {
    console.log("upload")
    let formData = new FormData()
    formData.append("video", this.file)
    formData.append("cover", this.imgInfo)
    formData.append("title", this.uploadForm.value.title!)
    formData.append("publisher", this.secondFormGroup.value.publisher!)
    formData.append("intro", this.secondFormGroup.value.introduce!)
    formData.append("genre", this.secondFormGroup.value.genre!)
    // console.log(this.file, this.imgURL)
    this.video.uploadVideo(formData).subscribe(val => {
      console.log(val)
      this.video.openSnackBar("Upload successed, now will jump to your uploaded list")
      setTimeout(() => {
        this.router.navigate(['/user/upload_list'])
      }, 2000)
    }, error => {
      let e = (error as HttpErrorResponse)
      if (e.status == 401) {
        this.video.openSnackBar("Please login")
        setTimeout(() => {
          this.router.navigate(['/user/login'])
        }, 2000)
      } else {
        this.video.openSnackBar("Something is wrong. Please try again!")
      }
    })
  }
  loaded(event: any, type: number) {
    this.progress(type)
    let video = event.target
    this.parseFirstFrame(video as HTMLVideoElement)
  }
  parseFirstFrame(video: HTMLVideoElement) {
    const toThumbFile = (blob: any) => new File([blob], 'thumb_img.png')
    const canvasElem = document.createElement('canvas')
    const { videoWidth, videoHeight } = video
    canvasElem.width = videoWidth
    canvasElem.height = videoHeight
    canvasElem.getContext('2d')!.drawImage(video, 0, 0, videoWidth, videoHeight)
    // 导出成blob文件
    let dataURL = canvasElem.toDataURL('image/jpeg')
    this.imgInfo = canvasElem.toBlob((blob) => {
      const thumbFile = toThumbFile(blob)
      this.imgInfo = thumbFile
    }, 'image/png')
    this.imgURL = dataURL
  }

}
