import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})
export class UploadComponent {
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
  constructor(private _formBuilder: FormBuilder) { }
}
