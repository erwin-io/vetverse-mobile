import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { ServiceType } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class ServiceTypeService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  get(): Observable<ApiResponse<ServiceType[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.serviceType)
    .pipe(
      tap(_ => this.log('serviceType')),
      catchError(this.handleError('serviceType', []))
    );
  }

  getById(serviceTypeId: string): Observable<ApiResponse<ServiceType>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.serviceType + serviceTypeId)
    .pipe(
      tap(_ => this.log('serviceType')),
      catchError(this.handleError('serviceType', []))
    );
  }

  add(data: any): Observable<ApiResponse<ServiceType>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.serviceType, data)
    .pipe(
      tap(_ => this.log('serviceType')),
      catchError(this.handleError('serviceType', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<ServiceType>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.serviceType, data)
    .pipe(
      tap(_ => this.log('serviceType')),
      catchError(this.handleError('serviceType', []))
    );
  }

  delete(serviceTypeId: string): Observable<ApiResponse<ServiceType>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.serviceType + serviceTypeId)
    .pipe(
      tap(_ => this.log('serviceType')),
      catchError(this.handleError('serviceType', []))
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
