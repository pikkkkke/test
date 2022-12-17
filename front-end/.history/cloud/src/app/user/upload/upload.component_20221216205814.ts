import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
  imgURL!: string | ArrayBuffer | null;
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
    console.log($files)
  }
  // 


  constructor(private _formBuilder: FormBuilder, private video: VideoService) { }

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
      console.log(files.target)
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
          this.imgURL = reader.result
        }


      };
    }, 0)

  }
  onSubmit() {
    console.log("upload")
  }
  loaded(event: any, type: number) {
    this.progress(type)
    let video = event.target
    this.parseFirstFrame(video as HTMLVideoElement)
  }
  parseFirstFrame(video: HTMLVideoElement) {
    const toThumbFile = (blob: any) => new File([blob], 'thumb__img.png')
    const canvasElem = document.createElement('canvas')
    const { videoWidth, videoHeight } = video
    canvasElem.width = videoWidth
    canvasElem.height = videoHeight
    canvasElem.getContext('2d')!.drawImage(video, 0, 0, videoWidth, videoHeight)
    // 导出成blob文件
    canvasElem.toBlob(blob => {
      // 将blob文件转换成png文件
      const thumbFile = toThumbFile(blob)
      console.log(URL.createObjectURL(blob as Blob))
      console.log(thumbFile, blob)
      this.imgURL = URL.createObjectURL(blob as Blob)
      console.log(this.imgURL)
      // this.imgURL = blob 
    }, 'image/png')
  }


}
