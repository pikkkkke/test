import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { loginInfo, User } from 'src/app/user';
import { UserService } from 'src/app/user.service';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.less']
})
export class SignupComponent implements OnInit {
  previous_url: string = ''
  constructor(private user: UserService, private fb: FormBuilder, private _snackBar: MatSnackBar, private router: Router, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe((param: ParamMap) => {
      this.previous_url = param.get("url") || ""
    })
  }
  signup_form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.pattern(/^(?![^a-zA-Z]+$)(?!\D+$)/)]],
    confirm: ['', [Validators.required, Validators.pattern(/^(?![^a-zA-Z]+$)(?!\D+$)/)]],
    email: ['', [Validators.required, Validators.email]]

  })
  onSubmit() {
    if (this.signup_form.status == "VALID") {
      let user: User = {
        username: this.signup_form.value.username || '',
        password: this.signup_form.value.password || '',
        email: this.signup_form.value.email || '',
        confirm: this.signup_form.value.confirm || '',

      }

      this.user.signup(user).subscribe(val => {
        this.user.jwt = (val as loginInfo).token!
        this.user.userName = (val as loginInfo).username!
        this.user.id = (val as loginInfo).id
        this.openSnackBar(`Sign up success, please login`)
        setTimeout(() => {
          this.router.navigate(['/user/login'])

        }, 2000)


      }, error => {
        let message = (error as HttpErrorResponse).error.error
        this.openSnackBar(message)
      })
    }
  }
  openSnackBar(info: string) {
    this._snackBar.open(info, 'OK', {
      horizontalPosition: "center",
      verticalPosition: "top",
      duration: 3000
    });
  }
}
