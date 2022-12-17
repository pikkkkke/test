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
  uploadForm = this._formBuilder.group({
    title: ['', Validators.required]
  })
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  isUploaded = false;
  isLinear = false;
  videoURL!: string | ArrayBuffer | null;
  fileChange(files: any) {
    // console.log(files.files);
    //  console.log(files.files.length);
    if (files.files.length === 0) {
      return;
    }
    const reader = new FileReader();
    if (files.files[0].type == 'video/mp4') {
      reader.readAsDataURL(files.files[0]);
      reader.onload = () => {
        this.videoURL = reader.result;
        this.video.openSnackBar("Upload success");
        setTimeout(() => {

        }, 2000)
      };
    }
  }
  upload($files: any) {
    console.log($files)
  }
  // 


  constructor(private _formBuilder: FormBuilder, private video: VideoService) { }

  file: any = undefined
  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any) {
    this.prepareFilesList(files);
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
  progress() {
    this.isUploaded = true
    this.showProgress = true
    this.showProgress = false
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: any) {
    if (files.target.files.length === 0) {
      return;
    }
    this.progress()
    const reader = new FileReader();
    reader.readAsDataURL(files.target.files[0]);
    console.log(files.target.files[0])
    this.uploadForm.setValue({ title: (files.target.files[0] as File).name })
    this.file = files.target.files[0]
    reader.onload = () => {
      this.videoURL = reader.result;
    };
  }
  onSubmit() {
    console.log("upload")
  }


}
