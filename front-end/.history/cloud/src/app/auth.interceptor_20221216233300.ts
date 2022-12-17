import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private user: UserService) { }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authReq = req.clone({
      headers: req.headers.set('x-access-token', this.user.jwt),
      url: req.url.replace("http://127.0.0.1:5000", "https://cloudprojectapi.azurewebsites.net")
    });

    return next.handle(authReq);
  }
}
