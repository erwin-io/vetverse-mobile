import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../storage/storage.service';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  private hiddenURLKeyword = ['g.payx.ph'];
  constructor(
    private router: Router,
    public toastController: ToastController,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if(this.hiddenURLKeyword.filter(x=>request.url.includes(x)).length <= 0) {
      const token = this.storageService.getAccessToken();

      if (token) {
        request = this.addTokenHeader(request, token);
      }

      request = request.clone({
        headers: request.headers.set('Accept', 'application/json'),
      });
      if (!request.headers.has('Content-Type')) {
        request = request.clone({
          setHeaders: {
            'content-type': 'application/json',
          },
        });
      }
      return next.handle(request).pipe(
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            !request.url.includes('auth/signin') &&
            error.status === 401
          ) {
            return this.handle401Error(request, next);
          }
          return throwError(error);
        })
      );
    }else {
      return next.handle(request).pipe(catchError((error) => throwError(error)));
    }
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refreshToken = this.storageService.getRefreshToken();
      const { userId } = this.storageService.getLoginUser();
      if (
        refreshToken ||
        refreshToken === undefined ||
        refreshToken !== 'null'
      ) {
        return this.authService
          // eslint-disable-next-line @typescript-eslint/naming-convention
          .refreshToken({ userId, refresh_token: refreshToken })
          .pipe(
            switchMap((token: any) => {
              this.isRefreshing = false;
              this.storageService.saveAccessToken(token.accessToken);
              this.storageService.saveRefreshToken(token.refreshToken);
              this.refreshTokenSubject.next(token.accessToken);

              return next.handle(
                this.addTokenHeader(request, token.accessToken)
              );
            }),
            catchError((error) => {
              this.isRefreshing = false;
              if (
                (error.error.success !== undefined ||
                  error.error.success !== null) &&
                error.error.success === false
              ) {
              } else {
                this.handleLogout();
              }
              return throwError(error);
            })
          );
      } else {
        this.handleLogout();
        this.isRefreshing = false;
      }
    }
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    request = request.clone({
      setHeaders: {
        // eslint-disable-next-line quote-props, @typescript-eslint/naming-convention
        Authorization: 'Bearer ' + token,
      },
    });
    return request;
  }

  private handleLogout() {
    this.authService.logout();
    this.storageService.saveAccessToken(null);
    this.storageService.saveRefreshToken(null);
    this.storageService.saveLoginUser(null);
    this.presentToast('Session expired');
    this.router.navigate(['auth/login'], { replaceUrl: true });
  }

  private async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }
}
