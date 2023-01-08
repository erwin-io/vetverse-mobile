import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

import { catchError, tap } from 'rxjs/operators';
import { IServices } from './interface/iservices';
import { AppConfigService } from './app-config.service';
import { StorageService } from '../storage/storage.service';
import { FcmService } from './fcm.service';
import { UserService } from './user.service';
import { Client } from '../model/client.model';
import { ApiResponse } from '../model/api-response.model';
import { LoginResult } from '../model/loginresult.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IServices {

  isLoggedIn = false;
  redirectUrl: string;

  constructor(private http: HttpClient,
    private appconfig: AppConfigService,
    private userService: UserService,
    private storageService: StorageService,
    private fcmService: FcmService
    ) { }

  login(data: any): Observable<ApiResponse<LoginResult>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.login, data)
    .pipe(
      tap(_ => this.isLoggedIn = true),
      catchError(this.handleError('login', []))
    );
  }

  logout(): Observable<any> {
    const currentUser = this.storageService.getLoginUser();
    if(currentUser) {
      this.fcmService.delete();
      this.userService.updateFirebaseToken({
        userId: currentUser.userId,
        firebaseToken: ''
      });
    }
    this.storageService.saveAccessToken(null);
    this.storageService.saveRefreshToken(null);
    this.storageService.saveLoginUser(null);
    this.storageService.saveSessionExpiredDate(null);
    this.storageService.saveTotalUnreadNotif(0);
    window.location.href = 'login';
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.logout)
    .pipe(
      tap(_ => this.isLoggedIn = false),
      catchError(this.handleError('logout', []))
    );
  }

  register(data: any): Observable<ApiResponse<Client>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.register, data)
    .pipe(
      tap(_ => this.log('register')),
      catchError(this.handleError('register', []))
    );
  }

  findByUsername(username: string): Observable<any> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.findByUsername + username)
    .pipe(
      tap(_ => this.log('findByUsername')),
      catchError(this.handleError('findByUsername', []))
    );
  }

  refreshToken(data: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.refreshToken, data)
    .pipe(
      tap(_ => this.log('refresh token')),
      catchError(this.handleError('refresh token', []))
    );
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.verifyOtp, data)
    .pipe(
      tap(_ => this.isLoggedIn = true),
      catchError(this.handleError('verify-otp', []))
    );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
