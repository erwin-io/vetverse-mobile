import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Role } from '../model/role.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class RoleService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  get(): Observable<ApiResponse<Role[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.role)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  getById(roleId: string): Observable<ApiResponse<Role>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.role + roleId)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<Role>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.role, data)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
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
