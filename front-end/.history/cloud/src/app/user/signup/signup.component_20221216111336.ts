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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  previous_url: string = ''
  constructor(private user: UserService, private fb: FormBuilder, private _snackBar: MatSnackBar, private router: Router, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe((param: ParamMap) => {
      this.previous_url = param.get("url") || ""
    })
  }
  loginform = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.pattern(/^(?![^a-zA-Z]+$)(?!\D+$)/)]],
    email: ['', [Validators.required, Validators.email]]
  })
  onSubmit() {
    if (this.loginform.status == "VALID") {
      let user: User = {
        username: this.loginform.value.username || '',
        password: this.loginform.value.password || '',
        email: this.loginform.value.email || '',

      }

      this.user.login(user).subscribe(val => {
        this.user.setUserJwt((val as loginInfo).token!)
        this.user.setUserName((val as loginInfo).username!)
        this.user.setId((val as loginInfo).id);
        this.openSnackBar(`Login successed username: ${(val as loginInfo).username}`)
        setTimeout(() => {
          if (this.previous_url != "") {
            console.log(decodeURIComponent(this.previous_url))
            this.router.navigate([decodeURIComponent(this.previous_url)])
          } else {
            this.router.navigate(['/index'])
          }

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
