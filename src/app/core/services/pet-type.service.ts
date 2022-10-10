import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { PetType } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class PetTypeService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  get(): Observable<ApiResponse<PetType[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petType)
    .pipe(
      tap(_ => this.log('petType')),
      catchError(this.handleError('petType', []))
    );
  }

  getById(petTypeId: string): Observable<ApiResponse<PetType>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petType + petTypeId)
    .pipe(
      tap(_ => this.log('petType')),
      catchError(this.handleError('petType', []))
    );
  }

  add(data: any): Observable<ApiResponse<PetType>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petType, data)
    .pipe(
      tap(_ => this.log('petType')),
      catchError(this.handleError('petType', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<PetType>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petType, data)
    .pipe(
      tap(_ => this.log('petType')),
      catchError(this.handleError('petType', []))
    );
  }

  delete(petTypeId: string): Observable<ApiResponse<PetType>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petType + petTypeId)
    .pipe(
      tap(_ => this.log('petType')),
      catchError(this.handleError('petType', []))
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
