import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})
export class UploadComponent {
  showProgress = false
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
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
      };
    }
  }
  upload($files: any) {
    console.log($files)
  }
  // 


  constructor(private _formBuilder: FormBuilder) { }

  files: any[] = [];

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
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    this.showProgress = true

    this.showProgress = false
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: any) {
    console.log(files)
    if (files.files.length === 0) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(files.files[0]);
    reader.onload = () => {
      this.videoURL = reader.result;
      console.log(this.videoURL);
    };
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
