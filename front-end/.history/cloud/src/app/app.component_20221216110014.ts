import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'cloud';
  isLogin = false
  constructor(public router: Router, private user: UserService, private route: ActivatedRoute) { }

  userStatus$!: Subscription
  ngOnInit(): void {
    this.userStatus$ = this.user.getUserStatus().subscribe(
      val => this.isLogin = true,
      error => {
        this.isLogin = false
      }
    )
    // 每次都获取下状态
    this.router.events.subscribe(val => {
      this.userStatus$.unsubscribe()
      this.userStatus$ = this.user.getUserStatus().subscribe(
        val => this.isLogin = true,
        error => {
          this.isLogin = false
        }
      )
    })
    console.log(this.userStatus$)
  }
  ngOnDestroy(): void {
    this.userStatus$.unsubscribe()
  }
  login() {
    this.router.navigate(['/user/login'])
  }
  signup() {
    this.router.navigate(['/user/signup'])
  }

  user_logout() {
    this.user.logout().subscribe(val => {
      console.log("logouted")
    }, error => {
      console.log("token invalid but logout")
    })
    this.isLogin = false
    this.router.navigate(['/index'])
  }
}
