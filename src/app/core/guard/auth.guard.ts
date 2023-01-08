/* eslint-disable @typescript-eslint/naming-convention */
import { StorageService } from 'src/app/core/storage/storage.service';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { map, catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { AppConfigService } from '../services/app-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  sessionTimeout;
  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService,
    private appconfig: AppConfigService
  ) {
    this.sessionTimeout = Number(this.appconfig.config.sessionConfig.sessionTimeout);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string) {
    console.log(this.storageService.getSessionExpiredDate());
    if (this.storageService.getSessionExpiredDate()) {
      const today: any = new Date();
      const sessionExpiredDate: any = new Date(
        this.storageService.getSessionExpiredDate()
      );
      const diffTime = today - sessionExpiredDate;
      if (diffTime > 0) {
        this.authService.redirectUrl = url;
        console.log('logout from authguard');
        this.authService.logout();
        return false;
      } else {
        today.setTime(today.getTime() + this.sessionTimeout * 1000);
        this.storageService.saveSessionExpiredDate(today);
      }
    } else {
      this.authService.redirectUrl = url;
      console.log('logout from authguard');
      this.authService.logout();
      return false;
    }
    const user = this.storageService.getLoginUser();
    const refresh_token = this.storageService.getRefreshToken();
    // const token = this.getRefreshToken(user.userId, refresh_token);

    if (!user || !refresh_token || refresh_token === '') {
      this.authService.redirectUrl = url;
      console.log('logout from authguard');
      this.authService.logout();
      return false;
    }
    // Store the attempted URL for redirecting

    // Navigate to the login page with extras
    this.authService.refreshToken({ userId: user.userId, refresh_token }).pipe(
      tap((token) => {
        if (!token) {
          console.log('logout from authguard');
          this.authService.logout();
          return false;
        } else {
          this.storageService.saveAccessToken(token.accessToken);
          this.storageService.saveRefreshToken(token.refreshToken);
          return true;
        }
      })
    );
    return true;
  }
}
